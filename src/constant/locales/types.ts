export interface TranslationKeys {
    nav: {
        about: string;
        advantage: string;
        products: string;
        buy: string;
        testimonials: string;
        start: string;
        contact: string;
        register: string;
        share: string;
        accountAdult: string;
        accountChild: string;
        back: string;
    };
    registerPage: {
        selectCountry: string;
        selectBranch: string;
        termsAndNewsletter: string;
    };
    hero: {
        eyebrow: string;
        headline: string;
        mission: string;
        cta: string;
    };
    publicGold: {
        title: string;
        desc: string;
        stats: {
            customers: string;
            branches: string;
            years: string;
        };
        statsLabels: {
            country: string;
        };
        whyTitle: string;
        features: Array<{
            title: string;
            description: string;
        }>;
    };
    benefit: {
        badge: string;
        title: string;
        desc: string;
        items: Array<{
            title: string;
            desc: string;
        }>;
    };
    products: {
        badge: string;
        title: string;
        subtitle: string;
        seeDetail: string;
        types: {
            dinar: string;
            goldbar: string;
        };
    };
    buy: {
        badge: string;
        title: string;
        subtitle: string;
        steps: Array<{
            title: string;
            desc: string;
        }>;
    };
    excellence: {
        badge: string;
        title: string;
        subtitle: string;
        items: Array<{
            title: string;
            text: string;
            points: string[];
            features: string[];
        }>;
    };
    paymentMethods: {
        badge: string;
        title: string;
        subtitle: string;
        items: Array<{
            title: string;
            subtitle: string;
            description: string;
            features: string[];
            cta: string;
        }>;
        note: string;
    };
    dealer: {
        badge: string;
        title: string;
        subtitle: string;
        benefits: Array<{
            title: string;
            desc: string;
        }>;
        joinTeam: string;
        teamBenefits: string[];
        quote: string;
    };
    cta: {
        dealerBadge: string;
        title: string;
        desc: string;
        whatsapp: string;
        badges: string[];
        footer: string;
    };
    contact: {
        badge: string;
        title: string;
        desc: string;
        form: {
            firstName: string;
            lastName: string;
            email: string;
            message: string;
            submit: string;
            placeholder: string;
        };
    };
    howToStart: {
        badge: string;
        title: string;
        subtitle: string;
        steps: Array<{
            title: string;
            desc: string;
        }>;
        cta: string;
        note: string;
    };
    startPage: {
        badge: string;
        title: string;
        desc: string;
        ctaPrimary: string;
        ctaSecondary: string;
        stepsTitle: string;
        stepsDesc: string;
        steps: Array<{
            title: string;
            desc: string;
        }>;
        guarantee: {
            title: string;
            subtitle: string;
        };
    };
    priceList: {
        badge: string;
        title: string;
        subtitle: string;
        loading: string;
        priceLabel: string;
        currency: string;
        pricePerWeight: string;
        currentPricePerGram: string;
        priceOptions: string;
        infoTitle: string;
        infoDesc: string;
        modeSaving: string;
        modeCash: string;
        poe: {
            title: string;
            subtitle: string;
            desc: string;
        };
        perGram: {
            title: string;
            subtitle: string;
            desc: string;
        };
    };
    testimonials: {
        badge: string;
        title: string;
        desc: string;
        items: Array<{
            quote: string;
            name: string;
            title: string;
        }>;
    };
    faq: {
        badge: string;
        title: string;
        desc: string;
        items: Array<{
            category: string;
            ask: string;
            answer: string;
        }>;
    };
    notFound: {
        title: string;
        desc: string;
        backHome: string;
        goBack: string;
    };
}
