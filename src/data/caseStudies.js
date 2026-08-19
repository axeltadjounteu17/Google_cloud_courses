// Études de cas officielles du guide d'examen Professional Cloud Architect v6.1.
//
// Contenu résumé et traduit en français à partir des PDF publiés par Google Cloud :
//   Altostrat Media  https://services.google.com/fh/files/misc/v6.1_pca_altostrat_media_case_study_english.pdf
//   Cymbal Retail    https://services.google.com/fh/files/misc/v6.1_pca_cymbal_retail_case_study_english.pdf
//   KnightMotives    https://services.google.com/fh/files/misc/v6.1_pca_knightmotives_automotive_case_study_english.pdf
//   EHR Healthcare   https://services.google.com/fh/files/misc/v6.1_pca_ehr_healthcare_case_study_english.pdf
//
// Contenu reformulé et condensé pour conformité avec les restrictions de licence.
// À lire en complément des PDF originaux, qui restent la source de référence.

export default [
  {
    id: "altostrat",
    name: "Altostrat Media",
    sector: "Médias & divertissement",
    icon: "layers",
    color: "violet",
    tagline: "Moderniser un catalogue média massif avec l'IA générative",
    source: "https://services.google.com/fh/files/misc/v6.1_pca_altostrat_media_case_study_english.pdf",
    overview:
      "Acteur majeur du secteur des médias, Altostrat exploite une très large bibliothèque de contenus audio et vidéo : podcasts, interviews, journaux d'information et documentaires. Leur enjeu est de faire tenir le rythme de leur système de gestion de contenu avec celui du marché.",
    concept:
      "Altostrat veut moderniser la gestion de contenu et l'engagement utilisateur avec l'IA générative de Google Cloud : recommandations personnalisées, interactions en langage naturel, support en self-service. En parallèle, l'entreprise cherche à augmenter son chiffre d'affaires via la tarification dynamique, le marketing ciblé et des suggestions de contenu personnalisées.",
    environment: [
      "Plate-forme de gestion et de diffusion de contenu sur **GKE** (scalabilité et haute disponibilité).",
      "Bibliothèque média (documents, audio, vidéo) stockée dans **Cloud Storage**.",
      "**BigQuery** comme entrepôt de données principal pour analyser comportements, consommation et démographie.",
      "**Cloud Run functions** pour les tâches événementielles : transcodage vidéo, extraction de métadonnées, recommandations.",
      "Systèmes **on-premises legacy** conservés pour l'ingestion et l'archivage de contenu, à moderniser prochainement.",
      "Identité et authentification : **Google Identity** combiné à des fournisseurs d'identité tiers.",
      "Observabilité : mélange de **Cloud Monitoring** et de **Prometheus** open source, alertes principalement par e-mail.",
    ],
    business: [
      "Accélérer et fiabiliser les workflows opérationnels sur tous les environnements (Google Cloud + on-premises).",
      "Simplifier la gestion de l'infrastructure pour déployer les applications plus rapidement.",
      "Optimiser les coûts de stockage cloud tout en gardant haute disponibilité et scalabilité.",
      "Permettre l'interaction en langage naturel avec la plate-forme, support utilisateur 24/7.",
      "Générer automatiquement des résumés concis des contenus média.",
      "Extraire des métadonnées riches des médias via NLP et vision par ordinateur.",
      "Détecter et filtrer les contenus inappropriés.",
      "Analyser les contenus pour identifier les tendances et en extraire des enseignements.",
      "Appuyer la stratégie de contenu et les décisions sur les données.",
    ],
    technical: [
      "Moderniser la CI/CD pour les déploiements conteneurisés, avec une plate-forme de gestion centralisée.",
      "Connectivité hybride sécurisée et performante pour l'ingestion de données.",
      "Environnements Kubernetes scalables et performants à la fois on-premises et dans le cloud.",
      "Optimiser les coûts de stockage face à la croissance des volumes média.",
      "Concevoir une détection des contenus nuisibles pilotée par l'IA.",
      "Garantir que les systèmes d'IA soient auditables et leurs décisions explicables.",
      "Exploiter les LLM et l'IA conversationnelle pour personnaliser l'expérience.",
      "Développer des chatbots avancés avec compréhension du langage naturel.",
      "Résumé automatisé pour des médias de natures diverses.",
    ],
    executive:
      "La direction place la fiabilité et la maîtrise des coûts au premier rang des priorités. L'IA générative doit servir la découverte de contenu, la recommandation personnalisée et l'interaction fluide, pour approfondir l'engagement, fidéliser et ouvrir de nouvelles sources de revenus.",
    keywords: ["GKE", "Cloud Storage", "BigQuery", "Cloud Run functions", "Gemini", "hybride", "Prometheus"],
  },

  {
    id: "cymbal",
    name: "Cymbal Retail",
    sector: "Commerce en ligne",
    icon: "cart",
    color: "orange",
    tagline: "Enrichir un catalogue produit et vendre en conversationnel",
    source: "https://services.google.com/fh/files/misc/v6.1_pca_cymbal_retail_case_study_english.pdf",
    overview:
      "Cymbal est un détaillant en ligne en forte croissance. Son assortiment couvre plusieurs sous-secteurs du commerce, ce qui fait de la gestion de son très vaste catalogue produit un défi permanent.",
    concept:
      "Cymbal veut moderniser ses opérations et son expérience client sur trois axes : enrichissement automatisé du catalogue et des contenus par IA générative ; commerce conversationnel avec découverte produit via des agents virtuels ; modernisation de la pile technique pour réduire les coûts liés aux processus manuels, aux transferts de données et à la gestion des erreurs.",
    environment: [
      "Mélange de systèmes **on-premises** et cloud.",
      "Bases de données variées : **MySQL**, **Microsoft SQL Server**, **Redis**, **MongoDB** pour le catalogue et les données clients.",
      "Clusters **Kubernetes** pour les applications conteneurisées.",
      "Intégrations legacy à base de fichiers : transferts **SFTP**, traitements **ETL par lots**.",
      "Application web maison qui laisse le client parcourir le catalogue en interrogeant les bases relationnelles par nom et catégorie de produit.",
      "Système **IVR** (serveur vocal interactif) pour le premier niveau d'appel, avec routage vers les services concernés.",
      "Agents de centre d'appels qui reprennent les appels transférés et saisissent manuellement les commandes quand le client n'a pas pu finaliser seul.",
      "Outils de supervision open source : **Grafana**, **Nagios**, **Elastic**.",
      "Difficultés constatées : processus manuels lents et sujets aux erreurs, silos de données qui empêchent une vue unifiée du parcours client, intégration de nouvelles technologies compliquée.",
    ],
    business: [
      "Automatiser l'enrichissement du catalogue : moins d'effort manuel, moins d'erreurs, cohérence garantie.",
      "Améliorer la découvrabilité produit et la pertinence de la recherche.",
      "Augmenter l'engagement client par une expérience d'achat interactive et personnalisée, et réduire les retours produit.",
      "Améliorer le taux de conversion et la croissance du chiffre d'affaires.",
      "Réduire les coûts : effectifs du centre d'appels et hébergement en centre de données.",
    ],
    technical: [
      "Génération d'attributs : déduire les attributs produit pertinents depuis des données fournisseurs hétérogènes (titres, descriptions, images), en cohérence avec la catégorie et la structure du catalogue existant.",
      "Génération et amélioration d'images : produire des variantes depuis une image de base (couleurs, arrière-plan, incrustation de texte).",
      "Découverte produit automatisée : traiter les demandes en langage naturel et renvoyer des résultats très pertinents.",
      "Scalabilité et performance : absorber le catalogue actuel et la croissance prévue sans dégrader l'expérience.",
      "Revue humaine dans la boucle (**HITL**) : interface permettant aux collaborateurs d'approuver, rejeter ou modifier les suggestions de l'IA avant mise à jour du catalogue.",
      "Sécurité et conformité des données : traitement sécurisé des données clients, des informations produit et des interactions avec les agents virtuels, conforme aux réglementations du secteur.",
    ],
    executive:
      "L'IA générative appliquée au commerce digital doit réduire les coûts opérationnels par l'automatisation du catalogue, accélérer l'intégration de nouveaux produits, améliorer la cohérence des informations sur tous les canaux, et offrir une expérience d'achat conversationnelle qui augmente la conversion.",
    keywords: ["Vertex AI Search", "Imagen", "Conversational Agents", "Cloud SQL", "Memorystore", "HITL", "DLP"],
  },

  {
    id: "knightmotives",
    name: "KnightMotives Automotive",
    sector: "Automobile & véhicules autonomes",
    icon: "cpu",
    color: "cyan",
    tagline: "Passer du constructeur automobile à l'expérience automobile",
    source: "https://services.google.com/fh/files/misc/v6.1_pca_knightmotives_automotive_case_study_english.pdf",
    overview:
      "KnightMotives construit des véhicules autonomes : électriques à batterie (BEV), hybrides et thermiques (ICE). L'expérience embarquée a progressé sur la flotte BEV, mais les hybrides et thermiques n'ont pas reçu ces systèmes et sont mal notés par la presse comme par les conducteurs, ce qui fait reculer les ventes et la satisfaction client.",
    concept:
      "KnightMotives veut passer de la fabrication de voitures à la création d'une « expérience automobile » complète. La stratégie donne la priorité à une expérience homogène sur tous les modèles, à des fonctionnalités pilotées par l'IA, à de nouveaux revenus issus de la monétisation des données, à une différenciation par le digital, et à de meilleurs outils pour les mécaniciens et les vendeurs.",
    environment: [
      "IT très majoritairement **on-premises**, avec quelques applications sur des plates-formes cloud majeures.",
      "Chaîne d'approvisionnement portée par un **mainframe obsolète**.",
      "**ERP obsolète**, ce qui rend difficile la mise en place de promotions et de remises revendeurs.",
      "Fragmentation entre véhicules : bases de code multiples et dette technique importante liée à la rétrocompatibilité.",
      "Connectivité réseau vers les usines et connectivité des véhicules en zones rurales : deux points faibles.",
      "Système de commande en ligne peu fiable ; la configuration de véhicule pour acquisition via un concessionnaire ne fournit ni les données ni la fiabilité attendues, ce qui tend la relation avec les concessionnaires.",
      "Les concessionnaires n'ont pas de budget pour de nouveaux équipements.",
    ],
    business: [
      "Nouer une relation personnalisée avec le conducteur et offrir une expérience cohérente sur tous les modèles.",
      "Améliorer le modèle de production à la commande (build-to-order) : réduire le temps d'immobilisation et apporter de la transparence aux concessionnaires comme aux clients.",
      "Monétiser les données de l'entreprise pour financer les investissements technologiques ; l'infrastructure d'IA actuelle est obsolète et les données restent cloisonnées.",
      "Sécurité : préoccupation majeure, l'entreprise a déjà subi des fuites de données.",
      "Conformité aux réglementations européennes de protection des données, en particulier pour les plates-formes autonomes émergentes.",
      "Investissements importants dans la conduite autonome complète, d'abord dans les régions au cadre réglementaire favorable.",
      "Montée en compétence des équipes, attraction des talents, meilleure communication entre métier et technique.",
    ],
    technical: [
      "Expérience embarquée : UX cohérente intégrant les fonctionnalités d'IA sur tous les modèles, mise à jour du matériel et du logiciel des modèles anciens, connectivité fiable y compris en zone rurale pour les fonctions IA temps réel.",
      "Réseau : montée en charge pour absorber le trafic de données et améliorer la liaison entre usines et siège.",
      "Modernisation IT : adopter une stratégie **cloud hybride**, moderniser ou remplacer progressivement les systèmes legacy.",
      "Véhicule autonome : investir dans l'IA/ML de pointe, bâtir un environnement de **simulation** robuste, rester conforme à une réglementation qui évolue.",
      "Monétisation des données : plate-forme de gestion de données robuste, mesures strictes de sécurité et de confidentialité, infrastructure IA/ML scalable.",
      "Sécurité et gestion du risque : cadre de sécurité complet, plan de réponse à incident, sensibilisation des employés.",
      "Expérience concessionnaires et clients : améliorer le build-to-order en ligne, outiller les concessionnaires (ventes, service, stocks), mettre en place un **CRM** complet.",
    ],
    executive:
      "KnightMotives s'engage à améliorer la sécurité routière en exploitant un vaste corpus de données (conduite, état des routes, études comportementales, statistiques de sécurité en cas de collision) pour créer des expériences numériques marquantes. L'IA de l'entreprise dépasse les statistiques nationales de sécurité, et cette expérience doit être identique sur tous les modèles. — Michael Knight, CEO",
    keywords: ["hybride", "Dedicated Interconnect", "Pub/Sub", "BigQuery", "Analytics Hub", "Assured Workloads", "SCC", "GPU/TPU"],
  },

  {
    id: "ehr",
    name: "EHR Healthcare",
    sector: "Santé & assurance",
    icon: "shield",
    color: "green",
    tagline: "Sortir de la colocation pour une plate-forme scalable et conforme",
    source: "https://services.google.com/fh/files/misc/v6.1_pca_ehr_healthcare_case_study_english.pdf",
    overview:
      "EHR Healthcare édite un logiciel de dossier médical électronique distribué en SaaS à des cabinets médicaux multinationaux, des hôpitaux et des assureurs.",
    concept:
      "Portée par une croissance exponentielle liée aux évolutions rapides des secteurs de la santé et de l'assurance, l'entreprise doit pouvoir mettre son environnement à l'échelle, revoir son plan de reprise après sinistre et déployer des capacités de déploiement continu pour livrer plus vite. Google Cloud a été retenu pour remplacer les installations de colocation actuelles.",
    environment: [
      "Logiciel hébergé dans plusieurs installations de **colocation** ; le bail de l'un des centres de données arrive à échéance.",
      "Applications orientées client en **web**, dont beaucoup ont été récemment **conteneurisées** pour tourner sur un ensemble de clusters **Kubernetes**.",
      "Données réparties entre bases relationnelles et NoSQL : **MySQL**, **MS SQL Server**, **Redis**, **MongoDB**.",
      "Plusieurs intégrations legacy avec les assureurs, par fichiers et par API, hébergées **on-premises**. Remplacement prévu sur plusieurs années, aucun plan de migration ou de mise à niveau à ce stade.",
      "Utilisateurs gérés dans **Microsoft Active Directory**.",
      "Supervision assurée par divers outils open source ; alertes envoyées par e-mail et souvent ignorées.",
    ],
    business: [
      "Intégrer de nouveaux assureurs le plus vite possible.",
      "Assurer une disponibilité minimale de **99,9 %** sur tous les systèmes orientés client.",
      "Offrir une visibilité centralisée et une action proactive sur la performance et l'usage des systèmes.",
      "Renforcer la capacité à produire des enseignements sur les tendances de santé.",
      "Réduire la latence pour tous les clients.",
      "Maintenir la conformité réglementaire.",
      "Diminuer les coûts d'administration de l'infrastructure.",
      "Produire des prédictions et des rapports sur les tendances du secteur à partir des données des fournisseurs de soins.",
    ],
    technical: [
      "Conserver les interfaces legacy vers les assureurs, avec connectivité vers les systèmes on-premises et vers les fournisseurs cloud.",
      "Offrir une manière cohérente de gérer les applications orientées client à base de conteneurs.",
      "Fournir une connexion sécurisée et performante entre les systèmes on-premises et Google Cloud.",
      "Fournir des capacités homogènes de journalisation, rétention des logs, supervision et alerting.",
      "Maintenir et gérer plusieurs environnements conteneurisés.",
      "Mettre à l'échelle et provisionner de nouveaux environnements dynamiquement.",
      "Créer des interfaces pour ingérer et traiter les données de nouveaux fournisseurs.",
    ],
    executive:
      "La stratégie on-premises a fonctionné des années mais a coûté cher en temps et en argent : former les équipes sur des systèmes très différents, gérer des environnements similaires mais séparés, répondre aux pannes. Beaucoup de ces pannes venaient de systèmes mal configurés, d'une capacité insuffisante face aux pics de trafic et de pratiques de supervision incohérentes. Google Cloud doit apporter une plate-forme scalable et résiliente, homogène sur plusieurs environnements.",
    keywords: ["GKE Enterprise", "Cloud SQL", "Cloud Armor", "VPC Service Controls", "IAP", "Interconnect", "Cloud Monitoring"],
  },
];
