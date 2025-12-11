// Controllers/newsletterController.js
import Newsletter from '../Models/Newsletter.js';
import sendEmail from '../Utils/sendEmail.js';

/*
|--------------------------------------------------------------------------
| GET /api/newsletters
| Admin – Get all subscribers (optional filter)
|--------------------------------------------------------------------------
*/
export const getSubscribers = async (req, res) => {
  try {
    const { subscribed } = req.query;

    const filter = {};
    if (subscribed !== undefined) {
      filter.subscribed = subscribed === "true";
    }

    const subscribers = await Newsletter.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| PUBLIC GET /api/newsletters/public
| Frontend – Return only subscribed users (public access)
|--------------------------------------------------------------------------
*/
export const getPublicSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ subscribed: true }).lean();

    return res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/newsletters/subscribe
| Public – Subscribe or resubscribe user
|--------------------------------------------------------------------------
*/
export const subscribe = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Look for existing subscriber
    let subscriber = await Newsletter.findOne({ email });

    /*
    |-----------------------
    | Already subscribed
    |-----------------------
    */
    if (subscriber?.subscribed) {
      return res.status(400).json({
        success: false,
        message: "Email already subscribed",
      });
    }

    /*
    |-----------------------
    | Resubscribe user
    |-----------------------
    */
    if (subscriber) {
      subscriber.subscribed = true;
      subscriber.subscribedAt = Date.now();
      subscriber.unsubscribedAt = null;
      if (name) subscriber.name = name;
      await subscriber.save();

      sendWelcomeEmail(subscriber.email, name);

      return res.status(200).json({
        success: true,
        message: "Successfully resubscribed to newsletter",
        subscriber,
      });
    }

    /*
    |-----------------------
    | New subscriber
    |-----------------------
    */
    subscriber = await Newsletter.create({
      email,
      name,
      subscribed: true,
    });

    sendWelcomeEmail(subscriber.email, name);

    return res.status(201).json({
      success: true,
      message: "Successfully subscribed to newsletter",
      subscriber,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Helper function: Send welcome email
|--------------------------------------------------------------------------
*/
const sendWelcomeEmail = async (email, name = "") => {
  try {
    await sendEmail({
      email,
      subject: "Bienvenue à la Newsletter IMADEL",
      html: `
        <h1>Bienvenue ${name} !</h1>
        <p>Merci de vous être inscrit à la newsletter IMADEL.</p>
        <p>Vous recevrez désormais nos dernières actualités et mises à jour.</p>
        <br>
        <p>Cordialement,</p>
        <p><strong>L'équipe IMADEL</strong></p>
      `,
    });

    console.log("📨 Welcome email sent to:", email);
  } catch (err) {
    console.error("❌ Email sending failed for:", email, "| Reason:", err.message);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/newsletters/unsubscribe
| Public – Unsubscribe user
|--------------------------------------------------------------------------
*/
export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    subscriber.subscribed = false;
    subscriber.unsubscribedAt = Date.now();
    await subscriber.save();

    return res.status(200).json({
      success: true,
      message: "Successfully unsubscribed",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/newsletters/:id
| Admin – Delete subscriber
|--------------------------------------------------------------------------
*/
export const deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Newsletter.findByIdAndDelete(req.params.id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscriber deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
