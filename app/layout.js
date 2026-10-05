import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-display' });

export const metadata = {
  title: 'Office Hours | Course assistant',
  description: 'A course-material-grounded office hours demo.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${dmSerif.variable}`}>{children}</body>
    </html>
  );
}