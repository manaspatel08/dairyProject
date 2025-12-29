// import nodemailer from "nodemailer";

// export const sendContactMail = async (req, res) => {
//   try {
//     const { name, email, message } = req.body;

//     // const transporter = nodemailer.createTransport({
//     //   service: "gmail",
//     //   auth: {
//     //     user: process.env.EMAIL_USER,
//     //     pass: process.env.EMAIL_PASS,
//     //   },
//     // });

//     // await transporter.sendMail({
//     //   from: email,
//     //   to: process.env.EMAIL_USER,
//     //   subject: "New Contact Query - FoodTrove",
//     //   html: `
//     //     <h3>New Query</h3>
//     //     <p><b>Name:</b> ${name}</p>
//     //     <p><b>Email:</b> ${email}</p>
//     //     <p><b>Message:</b> ${message}</p>
//     //   `,
//     // });
    
    
//     res.status(200).json({ message: "Mail sent successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Mail failed", error });
//   }
// };
