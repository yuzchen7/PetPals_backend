import Heap from 'heap';
import db from '../utils/db'
import emailService from './emailSerivce';

class Notifier {
    queue = new Heap((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    async getallEvents(): Promise<any> | never {
        try{
            const all = await db.$transaction(async (prismadb: any) => {
                const all = await prismadb.event.findMany({
                    include: {
                        pet: {
                            include: {
                                master: true
                            }
                        }
                    }
                }).catch((error: any) => {
                    console.log(error)
                    throw new Error('Unable to get all events');
                });
                const now = new Date();
                const upcomingEvents = all.filter((event: any) => {
                    const startTime = new Date(event.start_time);
                    return !isNaN(startTime.getTime()) && startTime.getTime() > now.getTime();
                });
                return upcomingEvents;
            })
            return all;
        }catch (error: any) {
            console.log(error)
            throw new Error('Unable to get all events');
        }
    }
    
    async sendNotification(event: any) {
        await emailService.sendEmail(event.pet.master.email, 'Event Notification', `You have an event ${event.title} at ${event.start_time}`);
    }

    async checkQueue() {
        while (!this.queue.empty()) {
            const nextEvent = this.queue.peek();
            const now = new Date();
            const start_time = new Date(nextEvent.start_time);

            if (start_time.getTime() <= now.getTime()) {
                await this.sendNotification(nextEvent);
                this.queue.pop();
            } else {
                break;
            }
        }
    }


    async startNotifier(): Promise<void> {
        try {
            const allEvents = await this.getallEvents();
            console.log('allEvents:', allEvents);
            allEvents.forEach((event: any) => {
                this.queue.push(event);
            });

            const interval = 1 * 60 * 1000;
            const loop = async () => {
                console.log('Checking queue...');
                try {
                    await this.checkQueue();
                } catch (err) {
                    console.error('check queue error:', err);
                }
                setTimeout(loop, interval);
            };
            loop();
            
        } catch (error: any) {
            console.log(error)
            throw new Error('Unable to start notifier');
        }
    }
}

export default new Notifier();