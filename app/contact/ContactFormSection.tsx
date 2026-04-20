"use client";

import styles from "./ContactFormSection.module.css";

export default function ContactFormSection() {
    return (
        <section className={styles.formSection}>
            <div className={styles.container}>
                <div className={styles.formHeader}>
                    <h2 className={styles.title}>WE ARE WAITING FOR YOUR MESSAGE!</h2>
                    <p className={styles.subtitle}>
                        Please provide us most accurate information about your request. The more precise information we receive, the quicker your request will be processed.
                    </p>
                </div>

                <form className={styles.contactForm} onSubmit={(e) => e.preventDefault()}>
                    <div className={styles.formGrid}>
                        
                        <div className={styles.leftCol}>
                            <div className={styles.inputGroup}>
                                <label>NAME *</label>
                                <input type="text" required />
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label>EMAIL *</label>
                                <input type="email" required />
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label>PHONE NUMBER *</label>
                                <input type="tel" required />
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label>WHOM TO CONTACT *</label>
                                <div className={styles.selectWrapper}>
                                    <select required defaultValue="">
                                        <option value="" disabled>PLEASE CHOOSE THE RELEVANT DEPARTMENT</option>
                                        <option value="sales">Sales & Distributorship</option>
                                        <option value="support">Technical Support</option>
                                        <option value="general">General Inquiry</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className={styles.captchaGroup}>
                                <label>HUMAN CHECK *</label>
                                <div className={styles.fakeCaptcha}>
                                    <input type="checkbox" required id="human" />
                                    <label htmlFor="human">I am not a robot</label>
                                </div>
                            </div>
                        </div>

                        
                        <div className={styles.rightCol}>
                            <div className={styles.inputGroup}>
                                <label>COMPANY NAME *</label>
                                <input type="text" required />
                            </div>
                            
                            <div className={`${styles.inputGroup} ${styles.messageGroup}`}>
                                <label>MESSAGE *</label>
                                <textarea rows={8} required placeholder="Please provide exact details about your request. The more precise information we receive, the quicker your request will be processed."></textarea>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formFooter}>
                        <p className={styles.disclaimer}>
                            The form collecting your name, company name and email address so that our client service team can communicate with you and provide assistance. Please check our PRIVACY POLICY to see how we protect and manage your submitted data. 
                        </p>
                        <button type="submit" className={styles.submitBtn}>SEND NOW</button>
                    </div>
                </form>
            </div>
        </section>
    );
}
