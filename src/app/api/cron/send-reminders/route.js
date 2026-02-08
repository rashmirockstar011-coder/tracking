import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const remindersRef = collection(db, 'reminders');

        // Get reminders that:
        // 1. Are not completed
        // 2. Have email notification enabled
        // 3. Are due (datetime <= now)
        // 4. Haven't been sent yet (emailSentAt is null)
        const q = query(
            remindersRef,
            where('completed', '==', false),
            where('emailNotify', '==', true)
        );

        const snapshot = await getDocs(q);
        const sent = [];
        const failed = [];

        for (const docSnap of snapshot.docs) {
            const reminder = docSnap.data();
            const reminderTime = new Date(reminder.datetime);

            // Skip if not due yet or already sent
            if (reminderTime > now || reminder.emailSentAt) {
                continue;
            }

            try {
                // Send email using Resend
                await resend.emails.send({
                    from: 'Rashii Reminders <onboarding@resend.dev>',
                    to: 'useiteverywhereboy@gmail.com',
                    subject: `⏰ Reminder: ${reminder.title}`,
                    html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #f472b6 0%, #c084fc 100%); padding: 30px; border-radius: 15px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Reminder from Rashii 💕</h1>
              </div>
              
              <div style="background: #fdf2f8; padding: 30px; border-radius: 15px; margin-top: 20px;">
                <h2 style="color: #ec4899; margin-top: 0;">${reminder.title}</h2>
                <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                  This is your reminder set for <strong>${new Date(reminder.datetime).toLocaleString()}</strong>
                </p>
                ${reminder.recurrence !== 'none' ? `<p style="color: #a855f7; font-weight: 600;">🔄 Recurring: ${reminder.recurrence}</p>` : ''}
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding: 20px; color: #a1a1aa;">
                <p style="margin: 0;">Made with 💕 by Rashii</p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">For Shiv & Vaishnavi</p>
              </div>
            </div>
          `
                });

                // Mark as sent
                await updateDoc(doc(db, 'reminders', docSnap.id), {
                    emailSentAt: now.toISOString()
                });

                sent.push(docSnap.id);
            } catch (error) {
                console.error(`Failed to send reminder ${docSnap.id}:`, error);
                failed.push({ id: docSnap.id, error: error.message });
            }
        }

        return NextResponse.json({
            success: true,
            sent: sent.length,
            failed: failed.length,
            details: { sent, failed }
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { error: 'Failed to process reminders', details: error.message },
            { status: 500 }
        );
    }
}
