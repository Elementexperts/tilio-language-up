import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Tilio',
  description: 'Terms for using the Tilio language learning app.',
}

const sections = [
  {
    title: 'Using Tilio',
    body: [
      'Tilio provides language learning lessons, practice tools, streaks, rewards, referral features, and tester experiences.',
      'You agree to use Tilio lawfully, respectfully, and only for personal learning or approved testing purposes.',
      'Features may change as the product develops, especially during testing.',
    ],
  },
  {
    title: 'Accounts',
    body: [
      'You may sign in with email, Google, Telegram, or other supported methods.',
      'You are responsible for keeping your account access secure and for activity under your account.',
      'We may suspend or remove accounts that misuse the app, abuse rewards, attempt fake referrals, or interfere with the service.',
    ],
  },
  {
    title: 'Learning Content and Rewards',
    body: [
      'Lessons, XP, streaks, feathers, badges, and rewards are learning tools and do not have cash value.',
      'We may adjust rewards, lesson content, progress rules, or tester features to improve the app.',
      'We try to provide useful learning content, but we do not guarantee fluency, exam results, or specific outcomes.',
    ],
  },
  {
    title: 'User Content and Feedback',
    body: [
      'If you send feedback, bug reports, ideas, or suggestions, you allow us to use them to improve Tilio without obligation to compensate you.',
      'Do not submit content that is illegal, harmful, abusive, or violates someone else’s rights.',
    ],
  },
  {
    title: 'Privacy',
    body: [
      'Our Privacy Policy explains how we collect and use information.',
      'By using Tilio, you also agree to the data practices described in the Privacy Policy.',
    ],
  },
  {
    title: 'Disclaimers and Limits',
    body: [
      'Tilio is provided as available. We work to keep it reliable, but we cannot promise uninterrupted or error-free service.',
      'To the extent allowed by law, Tilio is not liable for indirect, incidental, or consequential damages from use of the app.',
    ],
  },
  {
    title: 'Changes',
    body: [
      'We may update these Terms as the product evolves.',
      'Continued use of Tilio after changes means you accept the updated Terms.',
    ],
  },
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="text-sm font-black text-primary">← Back to Tilio</a>
        <header className="mt-6 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-emerald-950/5">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Tilio</p>
          <h1 className="mt-2 text-4xl font-black leading-tight">Terms of Service</h1>
          <p className="mt-3 text-sm font-semibold text-muted-foreground">Effective date: May 12, 2026</p>
          <p className="mt-4 text-base font-semibold leading-7 text-muted-foreground">
            These Terms explain the basic rules for using Tilio. If you do not agree with them, please do not use the app.
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
