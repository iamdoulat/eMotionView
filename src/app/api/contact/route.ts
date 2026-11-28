import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { getDesignatedAdminEmail, sendContactNotificationEmail } from '@/lib/mail';
import { requireAdmin } from '@/lib/server-auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

/**
 * POST /api/contact
 * Handles contact form submissions with math captcha validation and admin notification email.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message, captchaAnswer, captchaExpected } = body;

    // 1. Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required.' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'A valid email address is required.' }, { status: 400 });
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json({ success: false, error: 'Inquiry subject is required.' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ success: false, error: 'Message must be at least 5 characters long.' }, { status: 400 });
    }

    // 2. Validate Math Captcha
    if (captchaAnswer === undefined || captchaExpected === undefined) {
      return NextResponse.json({ success: false, error: 'Please solve the security math challenge.' }, { status: 400 });
    }

    const parsedAnswer = Number(String(captchaAnswer).trim());
    const parsedExpected = Number(String(captchaExpected).trim());

    if (isNaN(parsedAnswer) || isNaN(parsedExpected) || parsedAnswer !== parsedExpected) {
      return NextResponse.json(
        {
          success: false,
          error: 'Security verification failed. Please check your math answer and try again.',
        },
        { status: 400 }
      );
    }

    // 3. Resolve designated admin email from General Settings
    const { email: designatedEmail, storeName } = await getDesignatedAdminEmail();

    // 4. Save to Database
    const db = await getMongoDb();
    const messageDoc = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      subject: subject.trim(),
      message: message.trim(),
      status: 'unread', // 'unread' | 'read' | 'replied'
      createdAt: new Date().toISOString(),
      adminRecipient: designatedEmail,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
    };

    let insertedId = '';
    if (db) {
      const result = await db.collection('contact_messages').insertOne(messageDoc);
      insertedId = result.insertedId.toString();
    }

    // 5. Send Email Notification to designated admin email
    const mailResult = await sendContactNotificationEmail(
      {
        name: messageDoc.name,
        email: messageDoc.email,
        phone: messageDoc.phone,
        subject: messageDoc.subject,
        message: messageDoc.message,
        submittedAt: messageDoc.createdAt,
      },
      designatedEmail
    );

    // Update message doc with mail dispatch result
    if (db && insertedId) {
      await db.collection('contact_messages').updateOne(
        { _id: new ObjectId(insertedId) },
        {
          $set: {
            mailDispatched: mailResult.success,
            mailSimulated: mailResult.simulated,
            mailRecipient: mailResult.targetEmail,
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Thank you, ${messageDoc.name}! Your message has been received. Our team will review your inquiry and get back to you shortly.`,
      notificationSentTo: designatedEmail,
    });
  } catch (error: any) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contact
 * Admin endpoint to list contact messages.
 */
export async function GET(req: NextRequest) {
  const adminUser = await requireAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json({ success: true, messages: [] });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const filter: Record<string, any> = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const messages = await db
      .collection('contact_messages')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const formatted = messages.map((m) => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      phone: m.phone,
      subject: m.subject,
      message: m.message,
      status: m.status || 'unread',
      createdAt: m.createdAt,
      adminRecipient: m.adminRecipient,
      mailDispatched: m.mailDispatched,
      mailSimulated: m.mailSimulated,
    }));

    return NextResponse.json({ success: true, messages: formatted });
  } catch (error: any) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
  }
}

/**
 * PATCH /api/contact
 * Admin endpoint to update message status.
 */
export async function PATCH(req: NextRequest) {
  const adminUser = await requireAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status are required' }, { status: 400 });
    }

    const db = await getMongoDb();
    if (db) {
      await db.collection('contact_messages').updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date().toISOString() } }
      );
    }

    return NextResponse.json({ success: true, message: 'Message updated' });
  } catch (error: any) {
    console.error('Error updating contact message:', error);
    return NextResponse.json({ success: false, error: 'Failed to update message' }, { status: 500 });
  }
}

/**
 * DELETE /api/contact
 * Admin endpoint to delete a contact message.
 */
export async function DELETE(req: NextRequest) {
  const adminUser = await requireAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    const db = await getMongoDb();
    if (db) {
      await db.collection('contact_messages').deleteOne({ _id: new ObjectId(id) });
    }

    return NextResponse.json({ success: true, message: 'Message deleted' });
  } catch (error: any) {
    console.error('Error deleting contact message:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete message' }, { status: 500 });
  }
}
