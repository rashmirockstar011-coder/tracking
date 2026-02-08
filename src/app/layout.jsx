import "./globals.css";

export const metadata = {
    title: "Rashii 💕 - For Shiv & Vaishnavi",
    description: "A private space for our promises, reminders, credits, and notes",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <div className="hearts-bg" aria-hidden="true">
                    {[...Array(15)].map((_, i) => (
                        <span
                            key={i}
                            className="heart"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                fontSize: `${1 + Math.random() * 1.5}rem`
                            }}
                        >
                            💕
                        </span>
                    ))}
                </div>
                {children}
            </body>
        </html>
    );
}
