import nodemailer from 'nodemailer'

const isEmailConfigured = Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.MAIL_FROM
)

const transporter = isEmailConfigured
    ? nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
          },
      })
    : null

export const sendPromotionEmail = async (subscribers, promotion) => {
    if (!transporter || subscribers.length === 0) {
        return { sent: false, reason: subscribers.length === 0 ? 'no-subscribers' : 'smtp-not-configured' }
    }

    const discount = promotion.discountType === 'percentage'
        ? `${promotion.discountValue}% off`
        : `${promotion.discountValue} off`
    const endDate = new Date(promotion.endDate).toLocaleDateString()

    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        bcc: subscribers.map((subscriber) => subscriber.email),
        subject: `New offer from Eco&Bio: ${promotion.code}`,
        text: `A new promotion is available. Use code ${promotion.code} for ${discount}. This offer ends on ${endDate}.`,
        html: `<h2>New offer from Eco&amp;Bio</h2><p>Use promo code <strong>${promotion.code}</strong> for <strong>${discount}</strong>.</p><p>Offer ends on ${endDate}.</p>`,
    })

    return { sent: true, count: subscribers.length }
}
