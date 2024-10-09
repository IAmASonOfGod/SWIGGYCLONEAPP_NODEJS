import { validationResult } from "express-validator";
import User from "../models/User";
import { Utils } from "../utils/Utils";
import { Nodemailer } from "../utils/Nodemailer";
import e = require("express");
import { JWT } from "../utils/Jwt";
import { Redis } from "../utils/Redis";
import moment = require("moment");
import * as ExcelJS from "exceljs";

export class userController {
  static async signup(req, res, next) {
    const errors = validationResult(req);
    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;
    const password = req.body.password;
    const type = req.body.type;
    const status = req.body.status;
    const verification_token = Utils.generateVerificationToken(6);

    try {
      const hash = await Utils.encryptPassword(password);
      const data = {
        email,
        verification_token,
        verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME,
        phone,
        password: hash,
        name,
        type,
        status,
      };
      let user = await new User(data).save();
      console.log((user as any).short_name);
      const user_data = {
        email: user.email,
        email_verified: user.email_verified,
        phone: user.phone,
        name: user.name,
        photo: user.photo || null,
        type: user.type,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
      const payload = {
        // user_:user._id,
        // aud: user._id,
        email: user.email,
        type: user.type,
      };

      const access_token = JWT.jwtSign(payload, user._id);
      const refresh_token = await JWT.jwtSignRefreshToken(payload, user._id);

      res.json({
        token: access_token,
        refreshToken: refresh_token,
        user: user_data,
      });
      // send email to user for verification
      await Nodemailer.sendMail({
        to: [user.email],
        subject: "Email Verification",
        html: `<h1>Your Otp is ${verification_token}</h1>`,
      });
    } catch (e) {
      next(e);
    }
  }

  static async verifyUserEmailToken(req, res, next) {
    const verification_token = req.body.phone;
    const email = req.user.email;

    try {
      const user = await User.findOneAndUpdate(
        {
          email,
          verification_token,
          verification_token_time: { $gt: Date.now() },
        },
        {
          email_verified: true,
          updated_at: new Date(),
        },
        {
          new: true,
          projection: {
            verification_token: 0,
            verification_token_time: 0,
            password: 0,
            reset_password_token: 0,
            reset_password_token_time: 0,
            __v: 0,
            __id: 0,
          },
        }
      );

      if (user) {
        await Nodemailer.sendMail({
          to: [user.email],
          subject: "Resend Email Verification",
          html: `<h1>Your Otp is ${verification_token}</h1>`,
        });
        res.json({ success: true });
      } else {
        throw new Error("User does not exist.");
      }
    } catch (e) {
      next(e);
    }
  }

  static async resendVerificationEmail(req, res, next) {
    const email = req.user.email;
    const verification_token = Utils.generateVerificationToken(6);
    try {
      const user = await User.findOneAndUpdate(
        { email: email },
        {
          updated_at: new Date(),
          verification_token: verification_token,
          verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME,
        }
      );
      if (user) {
        res.json({ success: true });
        await Nodemailer.sendMail({
          to: [user.email],
          subject: "Reset password email verification OTP",
          html: `<h1>Your Otp is ${verification_token}</h1>`,
        });
      } else {
        throw new Error("User does't exist");
      }
    } catch (error) {
      next(e);
    }
  }

  static async login(req, res, next) {
    const user = req.user;
    const password = req.query.password;

    const data = {
      password,
      encrypt_password: user.password,
    };

    try {
      await Utils.comparePassword(data);
      const payload = {
        // aud: user._id,
        email: user.email,
        type: user.type,
      };
      const access_token = JWT.jwtSign(payload, user._id);
      const refresh_token = await JWT.jwtSignRefreshToken(payload, user._id);
      const user_data = {
        email: user.email,
        email_verified: user.email_verified,
        phone: user.phone,
        name: user.name,
        photo: user.photom || null,
        type: user.type,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
      res.json({
        token: access_token,
        refreshToken: refresh_token,
        user: user_data,
      });
    } catch (e) {
      next(e);
    }
  }

  static async sendResetPasswordOtp(req, res, next) {
    const email = req.query.email;
    const reset_password_token = Utils.generateVerificationToken(6);
    try {
      const user = await User.findOneAndUpdate(
        { email: email },
        {
          updated_at: new Date(),
          reset_password_token: reset_password_token,
          reset_password_token_time: Date.now() + new Utils().MAX_TOKEN_TIME,
        }
      );
      if (user) {
        res.json({ success: true });
        await Nodemailer.sendMail({
          to: [user.email],
          subject: "Reset password email verification OTP",
          html: `<h1>Your Otp is ${reset_password_token}</h1>`,
        });
      } else {
        throw new Error("User does't exist");
      }
    } catch (error) {
      next(e);
    }
  }

  static verifyResetPasswordToken(req, res, next) {
    res.json({ success: true });
  }

  static async resetPassword(req, res, next) {
    const user = req.user;
    const new_password = req.body.new_password;
    try {
      const encryptedPassword = await Utils.encryptPassword(new_password);
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          updated_at: new Date(),
          password: encryptedPassword,
        },
        {
          new: true,
          projection: {
            verification_token: 0,
            verification_token_time: 0,
            password: 0,
            reset_password_token: 0,
            reset_password_token_time: 0,
            __v: 0,
          },
        }
      );
      if (updatedUser) {
        res.send(updatedUser);
      } else {
        throw new Error("User does't exist");
      }
    } catch (error) {
      next(e);
    }
  }

  static async profile(req, res, next) {
    const user = req.user;

    try {
      const profile = await User.findById(user.aud);
      if (profile) {
        const user_data = {
          email: profile.email,
          email_verified: profile.email_verified,
          phone: profile.phone,
          name: profile.name,
          photo: user.photom || null,
          type: profile.type,
          status: profile.status,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };
        res.send(user_data);
      } else {
        throw new Error("User does't exist");
      }
    } catch (error) {
      next(e);
    }
  }

  static async updatePhoneNumber(req, res, next) {
    const user = req.user;
    const phone = req.body.phone;
    try {
      const userData = await User.findByIdAndUpdate(
        user.aud,
        { phone: phone, updated_at: new Date() },
        {
          new: true,
          projection: {
            verification_token: 0,
            verification_token_time: 0,
            password: 0,
            reset_password_token: 0,
            reset_password_token_time: 0,
            __v: 0,
            __id: 0,
          },
        }
      );
      res.send(userData);
    } catch (error) {
      next(e);
    }
  }

  static async updateUserProfile(req, res, next) {
    const user = req.user;
    const phone = req.body.phone;
    const new_email = req.body.phone;
    const plain_password = req.body.password;
    const verification_token = Utils.generateVerificationToken(6);
    try {
      const userData = await User.findById(user.aud);
      if (userData) throw new Error("User doesn't exist");
      await Utils.comparePassword({
        password: plain_password,
        encrypt_password: userData.password,
      });
      const updatedUser = await User.findByIdAndUpdate(
        user.aud,
        {
          phone: phone,
          email: new_email,
          email_verified: false,
          verification_token,
          verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME,
          updated_at: new Date(),
        },
        {
          new: true,
          projection: {
            verification_token: 0,
            verification_token_time: 0,
            password: 0,
            reset_password_token: 0,
            reset_password_token_time: 0,
            __v: 0,
            __id: 0,
          },
        }
      );
      const payload = {
        // aud: user.aud,
        email: updatedUser.email,
        type: updatedUser.type,
      };
      const access_token = JWT.jwtSign(payload, user.aud);
      const refresh_token = await JWT.jwtSignRefreshToken(payload, user.aud);

      res.json({
        token: access_token,
        refreshToken: refresh_token,
        user: updatedUser,
      });
      // send email to user for  updated email verification
      await Nodemailer.sendMail({
        to: [updatedUser.email],
        subject: "Email Verification",
        html: `<h1>Your Otp is ${verification_token}</h1>`,
      });
    } catch (error) {
      next(e);
    }
  }

  static async getNewTokens(req, res, next) {
    // const refreshToken = req.body.refreshToken;
    const decoded_data = req.user;
    try {
      if (decoded_data) {
        const payload = {
          // aud: user._id,
          email: decoded_data.email,
          type: decoded_data.type,
        };
        const access_token = JWT.jwtSign(payload, decoded_data.aud);
        const refresh_token = await JWT.jwtSignRefreshToken(
          payload,
          decoded_data.aud
        );
        res.json({
          access_token: access_token,
          refreshToken: refresh_token,
        });
      } else {
        req.errrStatus = 403;
        throw "Access is forbidden";
      }
    } catch (error) {
      req.errrStatus = 403;
      next(error);
    }
  }

  static async logout(req, res, next) {
    const refreshToken = req.body.refreshToken;
    const decoded_data = req.user;
    try {
      if (decoded_data) {
        await Redis.deleteKey(decoded_data);
        res.json({
          success: true,
        });
      } else {
        req.errrStatus = 403;
        throw "Access is forbidden";
      }
    } catch (error) {
      req.errrStatus = 403;
      next(error);
    }
  }

  static async updateUserProfilePic(req, res, next) {
    const path = req.file.path;
    const user = req.user;
    try {
      const updatedUser = await User.findByIdAndUpdate(
        user.aud,
        {
          photo: path,
          updated_at: new Date(),
        },
        {
          new: true,
          projection: {
            verification_token: 0,
            verification_token_time: 0,
            password: 0,
            reset_password_token: 0,
            reset_password_token_time: 0,
            __v: 0,
            __id: 0,
          },
        }
      );
      res.send(updatedUser);
    } catch (error) {}
  }

  static async exportUserToExcel(req, res, next) {
    const startDate = moment(new Date()).startOf("month").toDate();
    const endDate = moment(new Date()).endOf("month").toDate();
    try {
      const users = await User.find({
        created_at: {
          $gte: startDate,
          $lite: endDate,
        },
        type: "user",
      });
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("users");
      worksheet.columns = [
        { header: "SL NO.", key: "s_no", width: 10 },
        { header: "NAME.", key: "name", width: 10 },
        { header: "EMAIL.", key: "email", width: 10 },
        { header: "EMAIL_VERIFIED.", key: "email_verified", width: 10 },
        { header: "PHONE.", key: "phone", width: 10 },
      ];
      let count = 1;
      users.forEach((user: any) => {
        user.s_no = count;
        worksheet.addRow(user);
        count++;
      });

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });

      // const data = await workbook.xlsx.writeFile("users.xlsx");
      const data = await workbook.xlsx.writeFile("src/uploads/users.xlsx"); //Excel file at a specific path
      res.send("exported successfully");
    } catch (e) {
      next(e);
    }
  }
}
