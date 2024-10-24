import type { FC, ReactNode } from 'react'
import { FaFacebook, FaTwitter, FaYoutube, FaInstagram } from 'react-icons/fa'
import Image from 'next/image'
import Link from "next/link"

type SocialLinks = {
  facebook?: string;
  twitter?: string;
  youtube?: string;
  instagram?: string;
};

type PolicyLink = {
  href: string;
  label: string;
};

type FooterProps = {
  logoSrc?: string;
  companyName?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  socials?: SocialLinks;
  policyLinks?: PolicyLink[];
  copyrightName?: string;
  children?: ReactNode;
};

const Footer: FC<FooterProps> = ({
  logoSrc = 'https://placehold.co/50x50/EEE/31343C?text=Logo',
  companyName = 'Your Company',
  address = '123 Main Street\nCity, State 12345',
  contactEmail = 'contact@example.com',
  contactPhone = '+1 (555) 123-4567',
  socials = { facebook: '#', twitter: '#', youtube: '#', instagram: '#' },
  policyLinks = [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
  copyrightName = 'Your Company Name',
  children
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="o_footer footer-light">
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-8 col-sm-12 text-left footer-text">
            <div className="footer-col">
              <div>
                <Image src={logoSrc} alt={`${companyName} Logo`} className="footer-img" loading="lazy" width={50} height={50} />
                <h4 className="footer-title">{companyName.toUpperCase()}</h4>
                <p className="footer-content">
                  {address.split('\n').map((line, idx) => (
                    <span key={idx}>{line}<br /></span>
                  ))}
                </p>
              </div>
              <div>
                <h4 className="footer-title">Get In Touch</h4>
                <p className="footer-content">
                  Call us on Phone: {contactPhone}<br />
                  Mail Us: <a href={`mailto:${contactEmail}`} className="footer-link">
                    {contactEmail}
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-sm-12 text-right footer-text">
            {children}
          </div>
        </div>
        <hr className="footer-bottom-separator" />
        <div className="row bottom-footer">
          <div className="footer-bottom-col">
            <p>© {currentYear} {copyrightName}</p>
          </div>
          <div className="footer-bottom-col">
            {policyLinks.map((link, index) => (
              <span key={link.href}>
                <Link href={link.href}>{link.label}</Link>
                {index < policyLinks.length - 1 && '|'}
              </span>
            ))}
          </div>
          <div className="footer-bottom-col">
            <ul className="footer-social">
              {socials.facebook && <li><Link target="_blank" href={socials.facebook} aria-label="Facebook"><FaFacebook size={20} /></Link></li>}
              {socials.twitter && <li><Link target="_blank" href={socials.twitter} aria-label="Twitter"><FaTwitter size={20} /></Link></li>}
              {socials.youtube && <li><Link target="_blank" href={socials.youtube} aria-label="YouTube"><FaYoutube size={20} /></Link></li>}
              {socials.instagram && <li><Link target="_blank" href={socials.instagram} aria-label="Instagram"><FaInstagram size={20} /></Link></li>}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;