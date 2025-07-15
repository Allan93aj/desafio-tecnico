import "./globals.css";
import Link from 'next/link';

// Layout raiz da aplicação, presente em todas as páginas
export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <head>
        {/* Importa a fonte Roboto do Google Fonts */}
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap" rel="stylesheet" />
      </head>
      {/* Body com layout flexível para manter o footer no final */}
      <body className="body-flex">
        {/* Header fixo no topo com navegação */}
        <header className="header-principal">
          <nav className="nav-principal">
            {/* Link para Home */}
            <Link href="/" className="link-principal">Home</Link>
            {/* Link para página de Ofertas */}
            <Link href="/ofertas" className="link-principal">Ofertas</Link>
          </nav>
        </header>
        {/* Main flexível para ocupar o espaço entre header e footer */}
        <main className="main-flex">{children}</main>
        {/* Footer padrão, sempre no final da página */}
        <footer className="footer-principal">
          desenvolvido por Allan Andrade de Jesus - 2025
        </footer>
      </body>
    </html>
  );
}
