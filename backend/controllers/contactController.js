import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  });
};

// Send contact form email
export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, phone, company, street, city, postalCode, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@hksfoods.com',
      to: 'info@hksfoods.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Contact Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; background-color: #f3f4f6; font-weight: bold; width: 150px;">Name:</td>
                <td style="padding: 8px; background-color: #ffffff;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; background-color: #f3f4f6; font-weight: bold;">Email:</td>
                <td style="padding: 8px; background-color: #ffffff;">${email}</td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 8px; background-color: #f3f4f6; font-weight: bold;">Phone:</td>
                <td style="padding: 8px; background-color: #ffffff;">${phone}</td>
              </tr>
              ` : ''}
              ${company ? `
              <tr>
                <td style="padding: 8px; background-color: #f3f4f6; font-weight: bold;">Company:</td>
                <td style="padding: 8px; background-color: #ffffff;">${company}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          ${street || city || postalCode ? `
          <div style="margin: 20px 0;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Address</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${street ? `
              <tr>
                <td style="padding: 8px; background-color: #f3f4f6; font-weight: bold; width: 150px;">Street:</td>
                <td style="padding: 8px; background-color: #ffffff;">${street}</td>
              </tr>
              ` : ''}
              ${city ? `
              <tr>
                <td style="padding: 8px; background-color: #f3f4f6; font-weight: bold;">City:</td>
                <td style="padding: 8px; background-color: #ffffff;">${city}</td>
              </tr>
              ` : ''}
              ${postalCode ? `
              <tr>
                <td style="padding: 8px; background-color: #f3f4f6; font-weight: bold;">Postal Code:</td>
                <td style="padding: 8px; background-color: #ffffff;">${postalCode}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          ` : ''}

          <div style="margin: 20px 0;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Message</h3>
            <div style="padding: 15px; background-color: #f9fafb; border-left: 4px solid #2563eb; white-space: pre-wrap;">
              ${message}
            </div>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>This email was sent from the HKS Foods contact form.</p>
            <p>Submitted on: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}</p>
          </div>
        </div>
      `
    };

    // Send email
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Contact form submitted successfully'
    });

  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send contact form. Please try again later.'
    });
  }
};
