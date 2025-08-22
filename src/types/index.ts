export interface ClientData {
    name: string;
    email: string;
    phone: string;
}

export interface AccountManagerData {
    name: string;
    email: string;
    phone: string;
}

export interface ProposalItem {
    id: string;
    name: string;
    description: string;
    unitPrice: number;
    setup: number;
    monthly: number;
    quantity: number;
    details?: any;
}

export interface Proposal {
    id: string;
    client: ClientData;
    accountManager: AccountManagerData;
    products: ProposalItem[];
    clientData?: ClientData;
    proposalItems?: ProposalItem[];
    accountManagerData?: AccountManagerData;
    totalSetup: number;
    totalMonthly: number;
    contractPeriod?: number;
    createdAt: string;
    status?: string;
    type?: string;
    proposalNumber?: string;
    userId: string;
    userEmail: string;
}
