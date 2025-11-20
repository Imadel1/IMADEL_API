// Utils/seedData.js
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Project from '../Models/Project.js';
import Job from '../Models/Job.js';
import Partner from '../Models/Partner.js';
import Office from '../Models/Office.js';
dotenv.config();

const sampleProjects = [
  {
    title: 'Initiative Eau Potable',
    description: 'Fournir de l\'eau potable et sûre aux communautés rurales du Nord du Mali.',
    fullDescription: 'Ce projet vise à installer des systèmes de purification d\'eau et des forages dans 15 communautés à travers la région de Tombouctou.',
    category: 'current',
    location: 'Région de Tombouctou, Mali',
    status: 'active',
    startDate: new Date('2024-01-15'),
    impactStats: {
      beneficiaries: 5000,
      communities: 15,
      budget: 250000
    },
    published: true
  },
  {
    title: 'Éducation pour Tous',
    description: 'Construire des écoles et fournir des ressources éducatives aux enfants défavorisés.',
    fullDescription: 'Notre initiative éducative se concentre sur la construction de salles de classe modernes et la fourniture de matériel d\'apprentissage aux enfants sans accès à une éducation de qualité.',
    category: 'current',
    location: 'Région de Ségou, Mali',
    status: 'active',
    startDate: new Date('2024-03-01'),
    impactStats: {
      beneficiaries: 3000,
      communities: 8,
      budget: 180000
    },
    published: true
  },
  {
    title: 'Projet d\'Accès aux Soins de Santé',
    description: 'Projet achevé qui a établi des cliniques mobiles dans les zones reculées.',
    fullDescription: 'Déploiement réussi de 5 cliniques mobiles qui servent maintenant plus de 10 000 personnes dans les communautés éloignées.',
    category: 'completed',
    location: 'Région de Gao, Mali',
    status: 'completed',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31'),
    impactStats: {
      beneficiaries: 10000,
      communities: 20,
      budget: 400000
    },
    published: true
  }
];

const sampleJobs = [
  {
    title: 'Coordinateur de Projet',
    description: 'Diriger et gérer les projets de développement communautaire dans les zones rurales.',
    requirements: [
      'Licence en Études du Développement ou domaine connexe',
      'Minimum 3 ans d\'expérience en gestion de projet',
      'Excellentes compétences en communication',
      'Maîtrise du français et des langues locales (Bambara, Songhay)'
    ],
    responsibilities: [
      'Coordonner les activités du projet dans plusieurs communautés',
      'Gérer les budgets et les délais du projet',
      'Préparer des rapports de progrès',
      'Liaison avec les chefs de communauté et les parties prenantes'
    ],
    location: 'Bamako, Mali',
    type: 'full-time',
    category: 'Gestion de Projet',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: 'open',
    salary: {
      min: 500000,
      max: 800000,
      currency: 'CFA'
    },
    published: true
  },
  {
    title: 'Agent de Communication',
    description: 'Gérer notre présence sur les réseaux sociaux et créer du contenu engageant sur notre travail.',
    requirements: [
      'Diplôme en Communication, Marketing ou domaine connexe',
      'Excellentes compétences en rédaction et édition',
      'Expérience en gestion des réseaux sociaux',
      'Compétences en photographie et montage vidéo'
    ],
    responsibilities: [
      'Créer du contenu pour les plateformes de réseaux sociaux',
      'Gérer les mises à jour du site web',
      'Rédiger des communiqués de presse et des articles',
      'Documenter les activités sur le terrain'
    ],
    location: 'Bamako, Mali',
    type: 'full-time',
    category: 'Communication',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    status: 'open',
    salary: {
      min: 400000,
      max: 650000,
      currency: 'CFA'
    },
    published: true
  }
];

const samplePartners = [
  {
    name: 'Programme des Nations Unies pour le Développement',
    logo: '/uploads/partner-undp.png',
    description: 'Soutien aux initiatives de développement durable et de réduction de la pauvreté.',
    website: 'https://www.undp.org',
    category: 'funding',
    partnershipStartDate: new Date('2022-01-01'),
    active: true
  },
  {
    name: 'Organisation Mondiale de la Santé',
    logo: '/uploads/partner-who.png',
    description: 'Partenariat pour les initiatives de santé et de santé publique.',
    website: 'https://www.who.int',
    category: 'technical',
    partnershipStartDate: new Date('2023-06-15'),
    active: true
  },
  {
    name: 'Ministère de l\'Éducation Nationale du Mali',
    logo: '/uploads/partner-men.png',
    description: 'Collaboration sur les programmes de développement éducatif.',
    website: 'https://www.education.gov.ml',
    category: 'government',
    partnershipStartDate: new Date('2021-09-01'),
    active: true
  }
];

const sampleOffices = [
  {
    name: 'Siège IMADEL',
    type: 'headquarters',
    address: {
      street: 'Avenue de l\'Indépendance',
      city: 'Bamako',
      region: 'District de Bamako',
      country: 'Mali',
      postalCode: 'BP 2345'
    },
    contact: {
      phone: '+223 20 12 34 56',
      email: 'info@imadel.org',
      fax: '+223 20 12 34 57'
    },
    coordinates: {
      latitude: 12.6392,
      longitude: -8.0029
    },
    active: true
  },
  {
    name: 'Bureau Régional du Nord',
    type: 'regional',
    address: {
      street: 'Rue de Tombouctou',
      city: 'Gao',
      region: 'Région de Gao',
      country: 'Mali',
      postalCode: 'BP 156'
    },
    contact: {
      phone: '+223 21 82 01 23',
      email: 'gao@imadel.org'
    },
    coordinates: {
      latitude: 16.2719,
      longitude: -0.0446
    },
    active: true
  }
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('🗑️  Suppression des données existantes...');
    await Project.deleteMany();
    await Job.deleteMany();
    await Partner.deleteMany();
    await Office.deleteMany();

    console.log('🌱 Ajout des projets...');
    await Project.insertMany(sampleProjects);
    console.log(`✅ ${sampleProjects.length} projets créés`);

    console.log('🌱 Ajout des emplois...');
    await Job.insertMany(sampleJobs);
    console.log(`✅ ${sampleJobs.length} emplois créés`);

    console.log('🌱 Ajout des partenaires...');
    await Partner.insertMany(samplePartners);
    console.log(`✅ ${samplePartners.length} partenaires créés`);

    console.log('🌱 Ajout des bureaux...');
    await Office.insertMany(sampleOffices);
    console.log(`✅ ${sampleOffices.length} bureaux créés`);

    console.log('🎉 Données d\'exemple ajoutées avec succès!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
    process.exit(1);
  }
};

seedData();