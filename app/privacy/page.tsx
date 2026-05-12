import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Tilio',
  description: 'How Tilio collects, uses, and protects user information.',
}

const sections = [
  {
    title: 'Information We Collect',
    body: [
      'Account information such as your name, email address, Google account profile details, Telegram profile details when used, and login identifiers.',
      'Learning progress such as selected courses, completed lessons, XP, streaks, rewards, referrals, and app preferences.',
      'Basic technical information such as device/browser details, app activity timestamps, and sync status needed to keep the service reliable.',
    ],
  },
  {
    title: 'How We Use Information',
    body: [
      'To create and manage your Tilio account, save your progress, restore your learning history, and show your rewards.',
      'To understand how testers use the app, including total testers, active users, course interest, and retention trends.',
      'To improve lessons, fix bugs, protect the service, and communicate important product or account updates.',
    ],
  },
  {
    title: 'Sharing',
    body: [
      'We do not sell personal information.',
      'We use trusted service providers such as Supabase, Google sign-in, Telegram Mini Apps, hosting, analytics, and infrastructure tools to operate Tilio.',
      'We may disclose information when required by law, to protect users, or to prevent misuse of the service.',
    ],
  },
  {
    title: 'Your Choices',
    body: [
      'You can use local progress where available, or sign in to save progress across devices.',
      'You can request account deletion or data access by contacting us.',
      'You can log out at any time from the Account screen.',
    ],
  },
  {
    title: 'Data Security and Retention',
    body: [
      'We use reasonable technical and organizational measures to protect account and progress data.',
      'We keep information as long as needed to provide Tilio, support testers, meet legal obligations, and improve the product.',
      'No online service can guarantee perfect security, but we work to keep the app and its data handling responsible.',
    ],
  },
  {
    title: 'Children',
    body: [
      'Tilio is intended for general language learning. If a child uses Tilio, a parent or guardian should supervise account creation and app usage.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="text-sm font-black text-primary">← Back to Tilio</a>
        <header className="mt-6 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-emerald-950/5">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Tilio</p>
          <h1 className="mt-2 text-4xl font-black leading-tight">Privacy Policy</h1>
          <p className="mt-3 text-sm font-semibold text-muted-foreground">Effective date: May 12, 2026</p>
          <p className="mt-4 text-base font-semibold leading-7 text-muted-foreground">
            This policy explains how Tilio collects and uses information when people use the app, sign in, test new features, or sync learning progress.
          </p>
        </header>

        <div className="mt-5 space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="rounded-[1.5rem] border border-white/70 bg-white/80 p-5 shadow-lg shadow-emerald-950/4">
              <h2 className="text-xl font-black">{section.title}</h2>
              <ul className="mt-3 space-y-2">
                {section.body.map((item) => (
                  <li key={item} className="text-sm font-semibold leading-6 text-muted-foreground">{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="mt-6 rounded-[1.5rem] bg-emerald-50/80 p-5 text-sm font-semibold leading-6 text-emerald-950">
          Contact: fayzullaevnomoz@gmail.com
        </footer>
      </div>
    </main>
  )
}
