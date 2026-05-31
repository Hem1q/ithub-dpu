import type { SubTopic } from "./schema";

/**
 * Encode a SubTopic object as a JSON string suitable for storage in the
 * `topics.sub_topics text[]` column.
 */
export function stringifySubTopic(s: SubTopic): string {
  return JSON.stringify(s);
}

/**
 * Decode a single sub-topic entry. Returns the rich SubTopic if the input is
 * a JSON-encoded object with the expected shape; otherwise returns the raw
 * string (for backward compatibility with legacy seed data).
 */
export function parseSubTopic(raw: string | SubTopic | null | undefined): SubTopic | string | null {
  if (raw == null) return null;
  if (typeof raw === "object") return raw;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) return raw;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && typeof parsed.titleUk === "string") {
      return parsed as SubTopic;
    }
  } catch {}
  return raw;
}

export function asStrings(items: SubTopic[]): string[] {
  return items.map(stringifySubTopic);
}

export const ciscoSubTopics: SubTopic[] = [
  {
    titleUk: "IT Essentials", titleEn: "IT Essentials",
    descUk: "Базові навички роботи з персональним комп'ютером, апаратним забезпеченням, операційними системами, основами мереж і безпеки. Готує до рольових позицій IT-технічної підтримки та сертифікацій CompTIA A+.",
    descEn: "Foundational skills for PC hardware, operating systems, networking and security. Prepares learners for IT helpdesk roles and CompTIA A+ certification.",
    url: "https://www.netacad.com/courses/it-essentials",
  },
  {
    titleUk: "CCNA: Introduction to Networks", titleEn: "CCNA: Introduction to Networks",
    descUk: "Перший модуль трисеместрової сертифікаційної програми CCNA. Архітектура мереж, моделі OSI/TCP, Ethernet, IPv4/IPv6, базова конфігурація комутаторів та маршрутизаторів Cisco IOS.",
    descEn: "First module of the three-semester CCNA path. Covers network architecture, OSI/TCP models, Ethernet, IPv4/IPv6 addressing and basic Cisco IOS device configuration.",
    url: "https://www.netacad.com/courses/ccna-introduction-networks",
  },
  {
    titleUk: "CCNA: Switching, Routing & Wireless Essentials", titleEn: "CCNA: Switching, Routing & Wireless Essentials",
    descUk: "Технології комутації, статична та динамічна маршрутизація (OSPF), VLAN, Inter-VLAN, безпровідні мережі WLAN, ACL, NAT та основи мережевої безпеки.",
    descEn: "Switching technologies, static and dynamic routing (OSPF), VLANs, Inter-VLAN routing, wireless WLANs, ACLs, NAT and network security fundamentals.",
    url: "https://www.netacad.com/courses/ccna-switching-routing-wireless-essentials",
  },
  {
    titleUk: "CCNA: Enterprise Networking, Security & Automation", titleEn: "CCNA: Enterprise Networking, Security & Automation",
    descUk: "Архітектура корпоративних мереж WAN/SD-WAN, VPN, QoS, віртуалізація, програмована автоматизація мереж, REST API, моделі SDN, основи моніторингу та аналітики.",
    descEn: "Enterprise WAN/SD-WAN architectures, VPNs, QoS, virtualisation, network automation, REST APIs, SDN models, monitoring and analytics fundamentals.",
    url: "https://www.netacad.com/courses/ccna-enterprise-networking-security-automation",
  },
  {
    titleUk: "Cybersecurity Essentials", titleEn: "Cybersecurity Essentials",
    descUk: "Загрози, вразливості та сучасні методи захисту інформації. Криптографія, ідентичність та контроль доступу, безпека мережі, ризик-менеджмент, реагування на інциденти.",
    descEn: "Threats, vulnerabilities and modern information-protection methods. Cryptography, identity and access control, network security, risk management and incident response.",
    url: "https://www.netacad.com/courses/cybersecurity-essentials",
  },
  {
    titleUk: "Network Security", titleEn: "Network Security",
    descUk: "Захист мережевої інфраструктури: міжмережеві екрани (Firepower/ASA), системи виявлення та запобігання вторгнень (IPS), VPN-тунелі (IPsec, SSL), захищені архітектури.",
    descEn: "Network infrastructure protection: firewalls (Firepower/ASA), intrusion detection/prevention systems (IPS), IPsec/SSL VPN tunnels and secure architectures.",
    url: "https://www.netacad.com/courses/network-security",
  },
  {
    titleUk: "Endpoint Security", titleEn: "Endpoint Security",
    descUk: "Захист кінцевих пристроїв: антишкідливе ПЗ, EDR, посилення ОС, керування патчами, шифрування дисків, контроль додатків та мобільних пристроїв.",
    descEn: "Endpoint protection: anti-malware, EDR, OS hardening, patch management, disk encryption, application and mobile-device control.",
    url: "https://www.netacad.com/courses/endpoint-security",
  },
  {
    titleUk: "DevNet Associate", titleEn: "DevNet Associate",
    descUk: "Програмована мережа та автоматизація. Python, REST API, Git, моделі даних YANG/JSON, інфраструктура як код, контейнери, CI/CD, готує до сертифікації Cisco DevNet Associate.",
    descEn: "Programmable networks and automation. Python, REST APIs, Git, YANG/JSON data models, infrastructure as code, containers and CI/CD; prepares for the Cisco DevNet Associate certification.",
    url: "https://www.netacad.com/courses/devnet-associate",
  },
  {
    titleUk: "Python Essentials 1 & 2", titleEn: "Python Essentials 1 & 2",
    descUk: "Введення у Python: типи даних, керуючі конструкції, функції, ООП, обробка винятків, файлове введення/виведення, модулі та пакети. Готує до іспиту PCEP / PCAP.",
    descEn: "Introduction to Python: data types, control flow, functions, OOP, exception handling, file I/O, modules and packages. Prepares for the PCEP/PCAP exams.",
    url: "https://www.netacad.com/courses/python-essentials-1",
  },
  {
    titleUk: "AI Fundamentals with IBM SkillsBuild", titleEn: "AI Fundamentals with IBM SkillsBuild",
    descUk: "Спільний курс Cisco × IBM: основи штучного інтелекту, машинне навчання, нейронні мережі, етика, прикладні AI-сервіси у бізнесі.",
    descEn: "Cisco × IBM joint course: AI fundamentals, machine learning, neural networks, ethics and applied AI business services.",
    url: "https://www.netacad.com/courses/ai-fundamentals-ibm-skillsbuild",
  },
];

export const oracleSubTopics: SubTopic[] = [
  {
    titleUk: "Database Foundations", titleEn: "Database Foundations",
    descUk: "Реляційна модель даних, нормалізація, ER-діаграми, життєвий цикл бази даних. Перший крок до Database Design and Programming with SQL.",
    descEn: "Relational data model, normalisation, ER diagrams and database lifecycle. The first step toward Database Design and Programming with SQL.",
    url: "https://academy.oracle.com/en/solutions-curriculum-database.html",
  },
  {
    titleUk: "Database Programming with SQL", titleEn: "Database Programming with SQL",
    descUk: "Поглиблений SQL: SELECT, з'єднання, підзапити, підсумкові функції, DDL/DML, обмеження цілісності, транзакції. Підготовка до Oracle Database SQL Certified Associate.",
    descEn: "Advanced SQL: SELECT, joins, subqueries, aggregate functions, DDL/DML, integrity constraints and transactions. Prepares for Oracle Database SQL Certified Associate.",
    url: "https://academy.oracle.com/en/oa-web-overview.html",
  },
  {
    titleUk: "Database Design and Programming with SQL", titleEn: "Database Design and Programming with SQL",
    descUk: "Об'єднаний курс із проєктування БД та програмування SQL. Бізнес-вимоги, ER-моделювання, фізичне проєктування, реалізація та оптимізація запитів.",
    descEn: "Combined course on database design and SQL programming. Business requirements, ER modelling, physical design, implementation and query optimisation.",
  },
  {
    titleUk: "Java Foundations", titleEn: "Java Foundations",
    descUk: "Базовий синтаксис Java, ООП, типи даних, керуючі конструкції, масиви, винятки. Готує до сертифікації Java Foundations Junior Associate.",
    descEn: "Basic Java syntax, OOP, data types, control flow, arrays and exceptions. Prepares for the Java Foundations Junior Associate certification.",
    url: "https://academy.oracle.com/en/oa-web-overview.html",
  },
  {
    titleUk: "Java Programming", titleEn: "Java Programming",
    descUk: "Розширені теми Java: колекції, дженерики, потоки, лямбда, Stream API, JDBC, основи багатопотоковості. Готує до Oracle Certified Associate Java SE 8 Programmer I.",
    descEn: "Advanced Java: collections, generics, streams, lambdas, Stream API, JDBC and concurrency basics. Prepares for Oracle Certified Associate Java SE 8 Programmer I.",
  },
  {
    titleUk: "Oracle APEX Application Development", titleEn: "Oracle APEX Application Development",
    descUk: "Розробка веб-додатків мовою Oracle APEX (low-code). Сторінки, форми, звіти, REST-сервіси, безпека, розгортання у Oracle Cloud Free Tier.",
    descEn: "Building web applications with Oracle APEX (low-code). Pages, forms, reports, REST services, security and deployment to Oracle Cloud Free Tier.",
    url: "https://apex.oracle.com/en/learn/",
  },
  {
    titleUk: "Oracle Cloud Infrastructure Foundations", titleEn: "Oracle Cloud Infrastructure Foundations",
    descUk: "Основи хмари OCI: обчислення, сховища, мережі, ідентичність та безпека, моделі ціноутворення. Готує до сертифікації OCI Foundations Associate (1Z0-1085).",
    descEn: "OCI fundamentals: compute, storage, networking, identity and security, pricing models. Prepares for the OCI Foundations Associate certification (1Z0-1085).",
    url: "https://education.oracle.com/oracle-cloud-infrastructure",
  },
  {
    titleUk: "Oracle Primavera P6 Foundations", titleEn: "Oracle Primavera P6 Foundations",
    descUk: "Управління проєктами в Primavera P6: WBS, ресурси, календарі, базові плани, аналіз критичного шляху, звітність.",
    descEn: "Project management in Primavera P6: WBS, resources, calendars, baselines, critical-path analysis and reporting.",
  },
  {
    titleUk: "Oracle Hospitality Digital Learning", titleEn: "Oracle Hospitality Digital Learning",
    descUk: "Цифрові ресурси для індустрії гостинності: системи управління готелями (PMS) Opera, POS-системи Simphony, аналітика обслуговування.",
    descEn: "Digital resources for the hospitality industry: hotel property-management systems (Opera PMS), Simphony POS and service analytics.",
  },
];

export const awsSubTopics: SubTopic[] = [
  {
    titleUk: "AWS Academy Cloud Foundations", titleEn: "AWS Academy Cloud Foundations",
    descUk: "Огляд хмарних обчислень та основних сервісів AWS: компʼют, сховища, бази даних, мережі, безпека, ціноутворення. Готує до AWS Certified Cloud Practitioner.",
    descEn: "Overview of cloud computing and core AWS services: compute, storage, databases, networking, security and pricing. Prepares for AWS Certified Cloud Practitioner.",
    url: "https://aws.amazon.com/training/awsacademy/",
  },
  {
    titleUk: "AWS Academy Cloud Architecting", titleEn: "AWS Academy Cloud Architecting",
    descUk: "Проєктування багаторівневих, високодоступних та відмовостійких архітектур AWS. EC2, VPC, RDS, S3, ELB, Auto Scaling, CloudFront, IAM. Готує до AWS Solutions Architect — Associate.",
    descEn: "Designing multi-tier, highly-available and fault-tolerant AWS architectures. EC2, VPC, RDS, S3, ELB, Auto Scaling, CloudFront and IAM. Prepares for AWS Solutions Architect — Associate.",
    url: "https://aws.amazon.com/training/awsacademy/",
  },
  {
    titleUk: "AWS Academy Cloud Operations", titleEn: "AWS Academy Cloud Operations",
    descUk: "Розгортання, моніторинг та автоматизація операцій у AWS. CloudFormation, CloudWatch, Systems Manager, Config, Trusted Advisor.",
    descEn: "Deploying, monitoring and automating operations on AWS. CloudFormation, CloudWatch, Systems Manager, Config and Trusted Advisor.",
    url: "https://aws.amazon.com/training/awsacademy/",
  },
  {
    titleUk: "AWS Academy Cloud Developing", titleEn: "AWS Academy Cloud Developing",
    descUk: "Розробка хмарних додатків з AWS SDK, Lambda, API Gateway, DynamoDB, SQS/SNS, X-Ray. CI/CD з CodePipeline, CodeBuild, CodeDeploy.",
    descEn: "Cloud application development with AWS SDK, Lambda, API Gateway, DynamoDB, SQS/SNS and X-Ray. CI/CD with CodePipeline, CodeBuild and CodeDeploy.",
    url: "https://aws.amazon.com/training/awsacademy/",
  },
  {
    titleUk: "AWS Academy Cloud Security Foundations", titleEn: "AWS Academy Cloud Security Foundations",
    descUk: "Модель спільної відповідальності, IAM, KMS, GuardDuty, WAF, Shield. Журналювання, моніторинг, реагування на інциденти у хмарі.",
    descEn: "Shared-responsibility model, IAM, KMS, GuardDuty, WAF and Shield. Logging, monitoring and cloud incident response.",
    url: "https://aws.amazon.com/training/awsacademy/",
  },
  {
    titleUk: "AWS Academy Data Engineering", titleEn: "AWS Academy Data Engineering",
    descUk: "Побудова конвеєрів даних у AWS: Glue, Kinesis, Redshift, EMR, Athena, Lake Formation. Аналіз великих даних і моделей даних для ML.",
    descEn: "Building data pipelines on AWS: Glue, Kinesis, Redshift, EMR, Athena and Lake Formation. Big-data analytics and data models for ML.",
    url: "https://aws.amazon.com/training/awsacademy/",
  },
  {
    titleUk: "AWS Academy Machine Learning Foundations", titleEn: "AWS Academy Machine Learning Foundations",
    descUk: "Цикл розробки ML-моделей у Amazon SageMaker: підготовка даних, тренування, оцінка, розгортання, моніторинг.",
    descEn: "ML model lifecycle in Amazon SageMaker: data preparation, training, evaluation, deployment and monitoring.",
    url: "https://aws.amazon.com/training/awsacademy/",
  },
  {
    titleUk: "AWS Academy Machine Learning for NLP", titleEn: "AWS Academy Machine Learning for NLP",
    descUk: "Обробка природної мови з ML: токенізація, ембедінги, моделі трансформерів, Amazon Comprehend, Lex, Translate.",
    descEn: "Natural-language processing with ML: tokenisation, embeddings, transformer models, Amazon Comprehend, Lex and Translate.",
    url: "https://aws.amazon.com/training/awsacademy/",
  },
  {
    titleUk: "AWS Academy Cloud Web Application Builder", titleEn: "AWS Academy Cloud Web Application Builder",
    descUk: "Створення повного веб-додатка у AWS: фронтенд (S3 + CloudFront), бекенд (Lambda + API Gateway), база даних (DynamoDB/RDS), автентифікація (Cognito).",
    descEn: "Building a full-stack web app on AWS: frontend (S3 + CloudFront), backend (Lambda + API Gateway), database (DynamoDB/RDS) and authentication (Cognito).",
    url: "https://aws.amazon.com/training/awsacademy/",
  },
  {
    titleUk: "AWS Academy Introduction to Cloud", titleEn: "AWS Academy Introduction to Cloud",
    descUk: "Початковий курс для першокурсників: концепції хмари, моделі сервісів (IaaS/PaaS/SaaS), типові сценарії використання, кар'єрні шляхи у хмарі.",
    descEn: "Introductory course for first-year students: cloud concepts, service models (IaaS/PaaS/SaaS), common use cases and cloud career paths.",
    url: "https://aws.amazon.com/training/awsacademy/",
  },
  {
    titleUk: "AWS Academy Learner Lab", titleEn: "AWS Academy Learner Lab",
    descUk: "Хмарне середовище-пісочниця з обмеженим бюджетом ($100) для самостійних експериментів зі справжніми сервісами AWS у навчальних цілях.",
    descEn: "Sandbox cloud environment with a limited $100 budget for hands-on experimentation with real AWS services for educational purposes.",
    url: "https://aws.amazon.com/training/awsacademy/",
  },
];
