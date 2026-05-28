

interface MenuItem {
    id: number
  label: string
  href?: string
  items?: MenuItem[]
}

  export const menuItems: MenuItem[] = [
    {
        id: 1,
        label: "Warm Up",
        href: "/warm-up"
    },
    {
        id: 22,
        label: "Tools",
        href: "/tools",
    },
    {
        id: 2,
        label: "Guides",
        href: "#",
        items: [
            {
                id: 21,
                label: "Guitar Helper - Vercel",
                href: "https://guitar-helper.vercel.app/",
            },
            {
                id: 23,
                label: "Music Sheet VS Guitar Tab",
                href:"/guides/23",
            },
            {
                id: 24,
                label: "How to Read Guitar Tablature",
                href:"/guides/24",
            }

        ]
    }
];
