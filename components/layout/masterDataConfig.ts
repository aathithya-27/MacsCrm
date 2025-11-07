import { 
    Building, GitFork, Briefcase, FileCog, Handshake, Badge, UserCog, FileText, Globe, Map, Heart, Users, PersonStanding, Filter, TrendingDown, TrendingUp, Puzzle, Award, CalendarHeart, CalendarDays, Landmark
} from 'lucide-react';

interface NavItem {
    to: string;
    label: string;
    icon: React.FC<{ className?: string }>;
    hasChildren?: boolean;
    children?: NavItem[];
}

export const masterDataNavItems: NavItem[] = [
    { to: "/masterData/companyMaster", label: "Company Master", icon: Building },
    { to: "/masterData/branch", label: "Branch", icon: GitFork },
    { to: "/masterData/businessVertical", label: "Business Vertical", icon: Briefcase },
    { to: "/masterData/geography", label: "Geography Management", icon: Globe },
    { to: "/masterData/financialYear", label: "Financial Year", icon: CalendarDays },
    { to: "/masterData/bankMaster", label: "Bank Master", icon: Landmark },
    { to: "/masterData/customerSegment", label: "Customer Segment", icon: Puzzle },
    { to: "/masterData/tierAndGift", label: "Type & Gift Management", icon: Award },
    { to: "/masterData/policyConfiguration", label: "Policy Configuration", icon: FileCog },
    { to: "/masterData/agency", label: "Agency and Scheme", icon: Handshake },
    { to: "/masterData/designation", label: "Designation", icon: Badge },
    { to: "/masterData/role", label: "Role", icon: UserCog },
    { to: "/masterData/documentMaster", label: "Document Master", icon: FileText },
    { to: "/masterData/route", label: "Route Master", icon: Map },
    { to: "/masterData/maritalStatus", label: "Marital Status", icon: Heart },
    { to: "/masterData/gender", label: "Gender", icon: Users },
    { to: "/masterData/relationship", label: "Relationship Master", icon: PersonStanding },
    { to: "/masterData/religionAndFestival", label: "Religion & Festival", icon: CalendarHeart },
    { to: "/masterData/leadStage", label: "Lead Stage Master", icon: Filter },
    { to: "/masterData/expenseCategory", label: "Expense Category", icon: TrendingDown },
    { to: "/masterData/incomeCategory", label: "Income Category", icon: TrendingUp },
];