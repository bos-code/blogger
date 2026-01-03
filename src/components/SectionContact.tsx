import { useState, FormEvent } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseconfig";
import { showSuccess, showError } from "../utils/sweetalert";
import PremiumSpinner from "./PremiumSpinner";
import SectionHead from "./sectionHead";

function SectionContact(): React.ReactElement {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      showError("Validation Error", "Please fill in all fields.");
      return;
    }

    if (name.trim().length < 3) {
      showError("Validation Error", "Name must be at least 3 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showError("Validation Error", "Please enter a valid email address.");
      return;
    }

    if (message.trim().length < 10) {
      showError("Validation Error", "Message must be at least 10 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Store message in Firestore
      await addDoc(collection(db, "messages"), {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
        read: false,
      });

      // Show success message
      showSuccess(
        "Message Sent!",
        "Thank you for reaching out. I'll get back to you soon!"
      );

      // Reset form
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      const errorMessage =
        (error as Error)?.message || "Failed to send message. Please try again.";
      showError("Error", errorMessage);
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-base-200 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 flex flex-col gap-8 sm:gap-12 lg:gap-16 items-center justify-center">
      <SectionHead
        title={"Contact"}
        descript={"I'm currently available for freelance work"}
      />

      <form
        onSubmit={handleSubmit}
        className="form w-full flex flex-col gap-8 sm:gap-12 lg:gap-16 items-center justify-center max-w-4xl"
      >
        <h3 className="form-header ibm-plex-md text-primary border-2 border-primary rounded-tl-2xl sm:rounded-tl-3xl lg:rounded-tl-4xl rounded-br-2xl sm:rounded-br-3xl lg:rounded-br-4xl px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-sm sm:text-base md:text-lg lg:text-xl self-center">
          Send me a message
        </h3>

        <div className="personals flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-16 xl:gap-32 items-center w-full">
          <fieldset className="fieldset flex flex-col gap-3 sm:gap-5 flex-1 w-full">
            <legend className="fieldset-legend ubuntu-light text-sm sm:text-base text-primary py-0">
              Your name *
            </legend>
            <input
              type="text"
              required
              placeholder="Enter your name"
              pattern="[A-Za-z][A-Za-z0-9\s\-]*"
              minLength={3}
              maxLength={50}
              title="Only letters, numbers, spaces or dash"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="input validator border-0 border-b-1 bg-transparent shadow-none rounded-none w-full items-start pl-0 border-secondary placeholder:text-sm sm:text-base placeholder:text-white focus:outline-0"
            />
          </fieldset>

          <fieldset className="fieldset flex flex-col gap-3 sm:gap-5 flex-1 w-full">
            <legend className="fieldset-legend ubuntu-light text-sm sm:text-base text-primary py-0">
              Your email *
            </legend>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="input validator border-0 border-b-1 bg-transparent shadow-none rounded-none w-full items-start pl-0 border-secondary placeholder:text-sm sm:text-base placeholder:text-white focus:outline-0"
            />
          </fieldset>
        </div>

        <fieldset className="fieldset w-full">
          <legend className="fieldset-legend ubuntu-light text-sm sm:text-base text-primary py-0">
            Your message *
          </legend>
          <textarea
            required
            minLength={10}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSubmitting}
            className="p-2 -pb-2 inline-block h-auto min-h-[120px] sm:min-h-[150px] border-0 border-b-1 bg-transparent shadow-none rounded-none w-full items-start pl-0 border-secondary placeholder:text-sm sm:text-base placeholder:text-white focus:outline-0"
            placeholder="Enter your needs"
          ></textarea>
        </fieldset>
        <button
          className="btn bg-primary text-base-100 text-base sm:text-lg lg:text-xl font-normal rounded-full py-3 sm:py-4 px-6 sm:px-8 flex items-center justify-center gap-2 sm:gap-4 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <PremiumSpinner size="sm" variant="neutral" showParticles={false} />
              <span>Sending...</span>
            </>
          ) : (
            <>
              Send Message
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M22.7071 1.29292C22.9306 1.5164 23.0262 1.81935 22.9939 2.11081C22.9848 2.19252 22.9657 2.27332 22.9366 2.35121L15.9439 22.3304C15.8084 22.7174 15.4504 22.9825 15.0408 22.9992C14.6311 23.0159 14.2527 22.7808 14.0862 22.4062L10.2424 13.7576L1.59387 9.91384C1.21919 9.74731 0.984122 9.36894 1.00084 8.95926C1.01755 8.54959 1.28265 8.19162 1.66965 8.05617L21.6488 1.06348C21.7272 1.03414 21.8085 1.01497 21.8907 1.00598C21.9511 0.999338 22.0117 0.998262 22.0717 1.00259C22.3032 1.01913 22.5301 1.11591 22.7071 1.29292ZM18.1943 4.3915L4.71108 9.11063L10.7785 11.8073L18.1943 4.3915ZM12.1928 13.2215L19.6085 5.80571L14.8894 19.289L12.1928 13.2215Z"
                  fill="#292F36"
                />
              </svg>
            </>
          )}
        </button>
      </form>
    </section>
  );
}

export default SectionContact;
