import { Settings as SettingsIcon, Building, Globe, Shield, Bell } from 'lucide-react';
import Card from '../components/common/Card';
import SectionHeader from '../components/common/SectionHeader';

export default function SettingsPage() {
  const settingSections = [
    { icon: Building, title: 'Company Profile', description: 'Manage company details, logo, and address', color: 'purple' },
    { icon: Globe, title: 'Localization', description: 'Currency, date format, and regional settings', color: 'blue' },
    { icon: Shield, title: 'Roles & Permissions', description: 'Manage user roles and access controls', color: 'green' },
    { icon: Bell, title: 'Notifications', description: 'Configure email and push notifications', color: 'amber' },
  ];

  const colorMap = {
    purple: 'from-purple-600 to-purple-700',
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    amber: 'from-amber-600 to-amber-700',
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={SettingsIcon}
        title="Settings"
        subtitle="System configuration & preferences"
        color="gray"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.title}
              className="hover:border-purple-500/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[section.color]} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-medium text-white group-hover:text-purple-300 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">{section.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
