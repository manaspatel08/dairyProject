import React from "react";
import { FiMapPin, FiMail, FiPhone, FiSend } from "react-icons/fi";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

import logo from "../assets/logo.jpg";
import card1 from "../assets/card1.png";
import card2 from "../assets/card2.png";
import card3 from "../assets/card3.png";
import banner3 from "../assets/cardimg.jpg";

const Footer = () => {
  return (
    <footer className="bg-light pt-5 pb-3 text-secondary">
      <div className="container">
 
        <div className="row g-5 align-items-start">
 
          <div className="col-lg-4 col-md-6">
            <img src={logo} alt="Foodzy" width="60" className="mb-3" />

            <p className="small">
              DairyStore is the biggest market of grocery products. Get your daily
              needs from our store.
            </p>

            <ul className="list-unstyled small">
              <li className="d-flex gap-2 mb-2">
                <FiMapPin className="text-success mt-1" />
                <span>
                  51, Green Street, Bhumi Park, Near Beach, Mumbai 400047
                </span>
              </li>
              <li className="d-flex gap-2 mb-2">
                <FiMail className="text-success mt-1" />
                <span>dairy@gmail.com</span>
              </li>
              <li className="d-flex gap-2">
                <FiPhone className="text-success mt-1" />
                <span>+91 6267543089</span>
              </li>
            </ul>
          </div>
 
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-semibold text-dark mb-3">Company</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link className="text-decoration-none text-secondary" to="about-us">About Us</Link></li>
              <li><Link className="text-decoration-none text-secondary" to="privacy-policy">Privacy Policy</Link></li>
              <li><Link className="text-decoration-none text-secondary" to="terms-conditions">Terms & Conditions</Link></li>
              <li><Link className="text-decoration-none text-secondary" to="contact-us">Contact Us</Link></li>
            </ul>
          </div>
 
          <div className="col-lg-1 d-none d-lg-block"></div>
 
          <div className="col-lg-4 col-md-6 ms-auto">
            <h6 className="fw-semibold text-dark mb-3">
              Subscribe Our Newsletter
            </h6>

            <form className="input-group rounded-pill border mb-3 overflow-hidden">
              <input
                type="email"
                className="form-control border-0 shadow-none small"
                placeholder="Enter your email"
              />
              <button className="btn btn-success px-3" type="button">
                <FiSend />
              </button>
            </form>
 
            <div className="d-flex gap-3 mb-3">
              <button className="btn btn-outline-success btn-sm rounded-circle">
                <FaFacebookF />
              </button>
              <button className="btn btn-outline-success btn-sm rounded-circle">
                <FaTwitter />
              </button>
              <button className="btn btn-outline-success btn-sm rounded-circle">
                <FaInstagram />
              </button>
            </div>
 
            <div className="row g-2">
              {[card1, card2, card3, banner3].map((img, i) => (
                <div className="col-3" key={i}>
                  <img
                    src={img}
                    alt=""
                    className="img-fluid rounded"
                    style={{ height: "60px", objectFit: "contain" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
 
        <div className="border-top text-center small mt-5 pt-3">
          © 2025 <span className="text-success fw-semibold">foodzy</span>, All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
