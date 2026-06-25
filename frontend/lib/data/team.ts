type TeamMember = {
  name: string;
  role?: string;
  title: string;
  email: string;
  link?: string;
  image: string;
};

type TeamCategory = {
  heading: string;
  members: TeamMember[];
};

export const team: TeamCategory[] = [
  {
    heading: 'Principal Investigator',
    members: [
      {
        name: 'Dr. Gyan P. Srivastava',
        title: `Department of Electrical Engineering and Computer Science
        University of Missouri, Columbia`,
        email: 'gps8b9@missouri.edu',
        link: 'https://engineering.missouri.edu/faculty/gyan-srivastava/',
        image: '/image/team/gpsrivastava.jpg',
      },
    ],
  },
  {
    heading: 'Co-Investigators',
    members: [
      {
        name: 'Prof. Dong Xu',
        title: `Department of Electrical Engineering and Computer Science
        University of Missouri, Columbia`,
        email: 'xudong@missouri.edu',
        link: 'https://engineering.missouri.edu/faculty/dong-xu/',
        image: '/image/team/dongxu.jpg',
      },
      {
        name: 'Dr. Muneendra Ojha',
        title: `Department of Information Technology
        Indian Institute of Information Technology, Allahabad`,
        email: 'muneendra@iiita.ac.in',
        link: 'https://www.linkedin.com/in/muneendra-ojha-a3153b15/',
        image: '/image/team/muneendraojha.jpg',
      },
    ],
  },
  {
    heading: 'TBEP v2 Development Team',
    members: [
      {
        name: 'Shivansh Gupta',
        title: `Indian Institute of Information Technology, Allahabad`,
        email: 'guptashivansh374@gmail.com',
        link: 'https://www.linkedin.com/in/sh1vanshgupta',
        image: '/image/team/shivanshgupta.jpeg',
      },
      {
        name: 'Urvija Roy Chowdhury',
        title: `Data Analytics & AI
             Validasen Inc., California`,
        email: 'roychowdhury.urvija@gmail.com',
        link: 'https://www.linkedin.com/in/urvija-roy-chowdhury-a7844426/',
        image: '/image/team/urvija.png',
      },
      {
        name: 'Abdul Azeem Ansari',
        title: `Indian Institute of Information Technology, Allahabad`,
        email: '23abdulazeem23@gmail.com',
        link: 'https://www.linkedin.com/in/abdulazeemansari',
        image: '/image/team/abdulazeem.jpg',
      },
      {
        name: 'Mishti garg',
        title: `Indian Institute of Information Technology, Allahabad`,
        email: 'gargmishti9@gmail.com',
        link: 'https://www.linkedin.com/in/mishti-garg-41aa2931b/',
        image: '/image/team/mishtigarg.jpeg',
      },
      {
        name: 'Kyan Mahajan',
        title: `Indian Institute of Information Technology, Allahabad`,
        email: 'kyanmahajan676@gmail.com',
        link: 'https://www.linkedin.com/in/kyan-mahajan-99a195315',
        image: '/image/team/kyanmahajan.jpeg',
      },
      {
        name: 'Sankalp Joshi',
        title: `Indian Institute of Information Technology, Allahabad`,
        email: 'sankalppjoshi30@gmail.com',
        link: 'https://www.linkedin.com/in/sankalp-joshi-iiita/',
        image: '/image/team/sankalpjoshi.jpeg',
      },
    ],
  },
  {
    heading: 'TBEP Development Team',
    members: [
      {
        name: 'Bhupesh Dewangan',
        title: `Artificial Intelligence and Multiagent Systems Lab
        Indian Institute of Information Technology, Allahabad`,
        email: 'bhupesh.it.iiita@gmail.com',
        link: 'https://www.linkedin.com/in/bhupesh-dewangan/',
        image: '/image/team/bhupeshdewangan.jpg',
      },
      {
        name: 'Debjyoti Ray',
        title: `Artificial Intelligence and Multiagent Systems Lab
        Indian Institute of Information Technology, Allahabad`,
        email: 'iec2022111@iiita.ac.in',
        link: 'https://www.linkedin.com/in/debjyotiray5811/',
        image: '/image/team/debjyotiray.jpg',
      },
      {
        name: 'Shraddha Srivastava',
        title: `Artificial Intelligence and Multiagent Systems Lab
        Indian Institute of Information Technology, Allahabad`,
        email: '	shraddhasrivas14@gmail.com',
        link: 'https://www.linkedin.com/in/shraddha-srivastava-898024212/',
        image: '/image/team/shraddhasrivastava.jpg',
      },
      {
        name: 'Yijie Ren',
        title: `Digital Biology Lab
        University of Missouri, Columbia`,
        email: 'yry7d@mail.missouri.edu',
        link: 'https://www.linkedin.com/in/yijie-ren-851a61141/',
        image: '/image/team/yijieren.jpg',
      },
      {
        name: 'Lei Jiang',
        title: `Digital Biology Lab
        University of Missouri, Columbia`,
        email: 'leijiang@missouri.edu',
        image: '/image/team/leijiang.jpg',
      },
    ],
  },
];


export const teamOsddin: TeamCategory[] = [
  {
    heading: 'Chief Mentor',
    members: [
      {
        name: 'Prof. Samir Brahmachari',
        title: `Former Director General CSIR, Former Secretary DSIR and Founding Director of CSIR-IGIB`,
        email: 'skb@igib.in',
        link: 'https://www.samirbrahmachari.com/',
        image: '/image/team/samirbrahmachari.jpg',
      },
    ],
  },
  {
    heading: 'Principal Investigator',
    members: [
      {
        name: 'Dr. Gyan P. Srivastava',
        title: `Department of Electrical Engineering and Computer Science
        University of Missouri, Columbia`,
        email: 'gps8b9@missouri.edu',
        link: 'https://engineering.missouri.edu/faculty/gyan-srivastava/',
        image: '/image/team/gpsrivastava.jpg',
      },
    ],
  },
  {
    heading: 'Co-Investigator',
    members: [
      {
        name: 'Prof. Vijay Tiwari',
        title: `Professor and Head of Research
        Institute of Molecular Medicine, SDU, Odense, Denmark`,
        email: 'Tiwari@health.sdu.dk',
        link: 'https://tiwarilab.org/',
        image: '/image/team/vijaytiwari.png',
      },
      {
        name: 'Dr. Muneendra Ojha',
        title: `Artificial Intelligence and Multi-Agent System (AIMS) Lab
        IIIT Allahabad`,
        email: 'muneendra@iiita.ac.in',
        link: 'https://aims.iiita.ac.in/',
        image: '/image/team/muneendraojha.jpg',
      },
    ],
  },
  {
    heading: 'TBEP v2 Development Team',
    members: [
      {
        name: 'Shivansh Gupta',
        title: `Indian Institute of Information Technology, Allahabad`,
        email: 'guptashivansh374@gmail.com',
        link: 'https://www.linkedin.com/in/sh1vanshgupta',
        image: '/image/team/shivanshgupta.jpeg',
      },
      {
        name: 'Urvija Roy Chowdhury',
        title: `Data Analytics & AI
             Validasen Inc., California`,
        email: 'roychowdhury.urvija@gmail.com',
        link: 'https://www.linkedin.com/in/urvija-roy-chowdhury-a7844426/',
        image: '/image/team/urvija.png',
      },
      {
        name: 'Abdul Azeem Ansari',
        title: `Indian Institute of Information Technology, Allahabad`,
        email: '23abdulazeem23@gmail.com',
        link: 'https://www.linkedin.com/in/abdulazeemansari',
        image: '/image/team/abdulazeem.jpg',
      },
      {
        name: 'Mishti garg',
        title: `Indian Institute of Information Technology, Allahabad`,
        email: 'gargmishti9@gmail.com',
        link: 'https://www.linkedin.com/in/mishti-garg-41aa2931b/',
        image: '/image/team/mishtigarg.jpeg',
      },
      {
        name: 'Kyan Mahajan',
        title: `Indian Institute of Information Technology, Allahabad`,
        email: 'kyanmahajan676@gmail.com',
        link: 'https://www.linkedin.com/in/kyan-mahajan-99a195315',
        image: '/image/team/kyanmahajan.jpeg',
      },
      {
        name: 'Sankalp Joshi',
        title: `Indian Institute of Information Technology, Allahabad`,
        email: 'sankalppjoshi30@gmail.com',
        link: 'https://www.linkedin.com/in/sankalp-joshi-iiita/',
        image: '/image/team/sankalpjoshi.jpeg',
      },
    ],
  },
  {
    heading: 'TBEP Development Team',
    members: [
      {
        name: 'Bhupesh Dewangan',
        title: `Artificial Intelligence and Multiagent Systems Lab
        Indian Institute of Information Technology, Allahabad`,
        email: 'bhupesh.it.iiita@gmail.com',
        link: 'https://www.linkedin.com/in/bhupesh-dewangan/',
        image: '/image/team/bhupeshdewangan.jpg',
      },
      {
        name: 'Debjyoti Ray',
        title: `Artificial Intelligence and Multiagent Systems Lab
        Indian Institute of Information Technology, Allahabad`,
        email: 'iec2022111@iiita.ac.in',
        link: 'https://www.linkedin.com/in/debjyotiray5811/',
        image: '/image/team/debjyotiray.jpg',
      },
      {
        name: 'Shraddha Srivastava',
        title: `Artificial Intelligence and Multiagent Systems Lab
        Indian Institute of Information Technology, Allahabad`,
        email: '	shraddhasrivas14@gmail.com',
        link: 'https://www.linkedin.com/in/shraddha-srivastava-898024212/',
        image: '/image/team/shraddhasrivastava.jpg',
      },
      {
        name: 'Yijie Ren',
        title: `Digital Biology Lab
        University of Missouri, Columbia`,
        email: 'yry7d@mail.missouri.edu',
        link: 'https://www.linkedin.com/in/yijie-ren-851a61141/',
        image: '/image/team/yijieren.jpg',
      },
      {
        name: 'Lei Jiang',
        title: `Digital Biology Lab
        University of Missouri, Columbia`,
        email: 'leijiang@missouri.edu',
        image: '/image/team/leijiang.jpg',
      },
    ],
  },
];
