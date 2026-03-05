import { MenuItem } from '../models/menu.model';

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: 'Base',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Tableau de bord',
          route: '/admin985xilinp/dashboard/main',
        },
      ],
    },
    {
      group: 'Collaboration',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/users.svg',
          label: 'Liste des utilisateurs',
          route: '/admin985xilinp/dashboard/users',
        },
        {
          icon: 'assets/icons/heroicons/outline/building-storefront.svg',
          label: 'Liste des pharmacies',
          route: '/admin985xilinp/dashboard/pharmacies',
        },
        {
          icon: 'assets/icons/heroicons/outline/clipboard-document-list.svg',
          label: "Demandes d'inscription",
          route: '/admin985xilinp/dashboard/registration-requests',
        },
        {
          icon: 'assets/icons/heroicons/outline/banknotes.svg',
          label: 'Liste des partenaires',
          route: '/admin985xilinp/dashboard/partners',
        },
        {
          icon: 'assets/icons/heroicons/outline/star.svg',
          label: 'Liste des tendances',
          route: '/admin985xilinp/dashboard/trends',
        },
        {
          icon: 'assets/icons/heroicons/outline/currency-dollar.svg',
          label: 'Publicités',
          route: '/admin985xilinp/dashboard/advertisements',
        },
      ],
    },
    {
      group: 'Éducation',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/queue-list.svg',
          label: 'Liste des catégories',
          route: '/admin985xilinp/dashboard/categories',
        },
        {
          icon: 'assets/icons/heroicons/outline/building-library.svg',
          label: 'Liste des fournisseurs',
          route: '/admin985xilinp/dashboard/providers',
        },
        {
          icon: 'assets/icons/heroicons/outline/user-group.svg',
          label: 'Liste des formateurs',
          route: '/admin985xilinp/dashboard/trainers',
        },
        {
          icon: 'assets/icons/heroicons/outline/video-camera.svg',
          label: 'Liste des capsules',
          route: '/admin985xilinp/dashboard/capsules',
          children: [
            { label: 'Capsules', route: '/admin985xilinp/dashboard/capsules/list' },
            { label: 'Catégories', route: '/admin985xilinp/dashboard/capsules/categories' },
          ],
        },
        {
          icon: 'assets/icons/heroicons/outline/academic-cap.svg',
          label: 'Liste des formations',
          route: '/admin985xilinp/dashboard/courses',
          children: [
            { label: 'Formations', route: '/admin985xilinp/dashboard/courses/list' },
            { label: 'Leçons', route: '/admin985xilinp/dashboard/courses/lessons' },
            { label: 'Quiz', route: '/admin985xilinp/dashboard/courses/quiz' },
            { label: 'Questions', route: '/admin985xilinp/dashboard/courses/questions' },
            { label: 'Certificats', route: '/admin985xilinp/dashboard/courses/certificates' },
          ],
        },
      ],
    },
    {
      group: 'Paiement',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/megaphone.svg',
          label: 'Abonnements',
          route: '/admin985xilinp/dashboard/subscriptions/packages',
        },
        {
          icon: 'assets/icons/heroicons/outline/credit-card.svg',
          label: 'Gestion des paiements',
          route: '/admin985xilinp/dashboard/subscriptions/list',
        },
      ],
    },
    {
      group: 'Configuration',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/camera.svg',
          label: 'Médias',
          route: '/admin985xilinp/dashboard/media',
        },
        {
          icon: 'assets/icons/heroicons/outline/presentation-chart-line.svg',
          label: 'SEO',
          route: '/admin985xilinp/dashboard/seo',
        },
        {
          icon: 'assets/icons/heroicons/outline/cog.svg',
          label: 'Paramètres',
          route: '/admin985xilinp/dashboard/settings',
        }
      ],
    },
  ];
  public static pagesCourse: MenuItem[] = [
    {
      group: 'Base',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/clipboard-document-list.svg',
          label: 'Cours détails',
          route: '/admin985xilinp/dashboard/manage-course/details',
        },
        {
          icon: 'assets/icons/heroicons/outline/bookmark-square.svg',
          label: 'Cours comprend',
          route: '/admin985xilinp/dashboard/manage-course/includes',
        },
        {
          icon: 'assets/icons/heroicons/outline/numbered-list.svg',
          label: 'Cours objectifs',
          route: '/admin985xilinp/dashboard/manage-course/goals',
        },
        {
          icon: 'assets/icons/heroicons/outline/book-open.svg',
          label: 'Cours chapitres',
          route: '/admin985xilinp/dashboard/manage-course/chapters',
        },
        {
          icon: 'assets/icons/heroicons/outline/calendar-date-range.svg',
          label: 'Cours classes',
          route: '/admin985xilinp/dashboard/manage-course/classes',
        },
        {
          icon: 'assets/icons/heroicons/outline/paper-clip.svg',
          label: 'Cours associé',
          route: '/admin985xilinp/dashboard/manage-course/relates',
        },
        {
          icon: 'assets/icons/heroicons/outline/queue-list.svg',
          label: 'Cours quiz',
          route: '/admin985xilinp/dashboard/manage-course/quiz',
        },
        {
          icon: 'assets/icons/heroicons/outline/question-mark-circle.svg',
          label: 'Cours questions',
          route: '/admin985xilinp/dashboard/manage-course/questions',
        },
        {
          icon: 'assets/icons/heroicons/outline/star.svg',
          label: 'Évaluation des avis',
          route: '/admin985xilinp/dashboard/manage-course/reviews',
        },
        {
          icon: 'assets/icons/heroicons/outline/chat-bubble-left-right.svg',
          label: 'Cours commentaires',
          route: '/admin985xilinp/dashboard/manage-course/comments',
        },
      ],
    },
  ];
}
