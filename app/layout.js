export const metadata = {
  title: 'مواقيت الصلاة',
  description: 'تطبيق إسلامي لمواقيت الصلاة',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif' }}>{children}</body>
    </html>
  )
}
