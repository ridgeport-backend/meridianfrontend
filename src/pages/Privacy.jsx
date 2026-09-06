import React from "react";

// This copy is placeholder legal text for demonstration. In production, the
// dealership's actual privacy policy should be reviewed by counsel and made
// editable from the admin CMS rather than hard-coded here.
const sections = [
  {
    title: "Information we collect",
    body: "When you create an account, browse inventory, or contact us, we collect information such as your name, email, phone number, delivery address, and details about vehicles you view, save, or purchase.",
  },
  {
    title: "Account information",
    body: "Your account stores your profile details, saved vehicles, order history, and support conversations so you don't have to re-enter them each visit.",
  },
  {
    title: "Vehicle inquiries",
    body: "When you request information, a video, or an inspection on a vehicle, we share your contact details with the relevant sales team member to follow up.",
  },
  {
    title: "Orders and payments",
    body: "Payment is processed through a provider-hosted checkout. We store an order reference and status, not your card number or CVV — those never reach our servers.",
  },
  {
    title: "Cookies and analytics",
    body: "We use cookies to keep you signed in and to understand how the site is used. You can manage cookie preferences at any time — see our Cookie Policy for details.",
  },
  {
    title: "Third-party services",
    body: "We work with shipping partners, payment processors, and financing providers who receive only the information necessary to fulfill their part of your order.",
  },
  {
    title: "Data retention",
    body: "We retain account and order records for as long as your account is active and as required by applicable tax, customs, and financial regulations.",
  },
  {
    title: "Your rights",
    body: "You can access, correct, or request deletion of your personal information from your account settings, or by contacting our support team.",
  },
];

export default function Privacy() {
  return (
    <div className="container-edit py-16 md:py-24">
      <div className="max-w-prose">
        <h1 className="font-display text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-steel">Last updated September 1, 2026</p>

        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg">{s.title}</h2>
              <p className="mt-2 text-steel">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-line pt-6 text-sm text-steel dark:border-lineDark">
          Questions about this policy? Reach us through the <a href="/contact" className="underline underline-offset-2">Contact page</a>.
        </div>
      </div>
    </div>
  );
}
