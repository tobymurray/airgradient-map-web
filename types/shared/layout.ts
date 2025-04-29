interface LayoutLink {
  label: string;
  path: string;
  openBlank: boolean;
}

export interface HeaderLink extends LayoutLink {}
export interface FooterLink extends LayoutLink {}

export interface FooterLinkGroup {
  group: number;
  links: FooterLink[];
}
