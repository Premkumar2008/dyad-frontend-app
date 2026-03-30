import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Settings, 
  LogOut, 
  User as UserIcon,
  Menu,
  X,
  Activity,
  CreditCard,
  Bell,
  Search,
  Heart,
  Stethoscope,
  Building,
  Check,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Define the workflow steps
const workflowSteps = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add your personal and professional information',
    icon: UserIcon,
    required: true,
    fields: ['firstName', 'lastName', 'email', 'phone', 'specialty']
  },
  {
    id: 'practice',
    title: 'Practice Information',
    description: 'Set up your healthcare practice details',
    icon: Building,
    required: true,
    fields: ['practiceName', 'address', 'phone', 'npiNumber']
  },
  {
    id: 'services',
    title: 'Services & Specialties',
    description: 'Define the medical services you provide',
    icon: Heart,
    required: true,
    fields: ['primaryServices', 'specialties', 'treatments']
  },
  {
    id: 'schedule',
    title: 'Schedule & Availability',
    description: 'Set your working hours and appointment slots',
    icon: Calendar,
    required: true,
    fields: ['workingHours', 'appointmentTypes', 'bufferTime']
  },
  {
    id: 'billing',
    title: 'Billing Setup',
    description: 'Configure payment and insurance options',
    icon: CreditCard,
    required: true,
    fields: ['paymentMethods', 'insuranceProviders', 'rates']
  },
  {
    id: 'documents',
    title: 'Document Templates',
    description: 'Prepare patient forms and templates',
    icon: FileText,
    required: false,
    fields: ['consentForms', 'medicalHistory', 'intakeForms']
  }
];

const ClientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  // Step workflow state
  const [currentStep, setCurrentStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [stepData, setStepData] = React.useState<Record<string, any>>({});
  const [isStepValid, setIsStepValid] = React.useState<Record<number, boolean>>({});

  // Debug logging
  React.useEffect(() => {
    console.log('ClientDashboard rendered!');
    console.log('Current path:', location.pathname);
    console.log('User:', user);
  }, [location.pathname, user]);

  // Initialize step validation
  React.useEffect(() => {
    const initialValidation: Record<number, boolean> = {};
    workflowSteps.forEach((_, index) => {
      initialValidation[index] = false;
    });
    setIsStepValid(initialValidation);
    
    // Validate initial step
    setTimeout(() => {
      validateCurrentStep();
    }, 100);
  }, []);

  // Re-validate when current step changes
  React.useEffect(() => {
    validateCurrentStep();
  }, [currentStep]);

  // Debug step validation state
  React.useEffect(() => {
    console.log('Step validation state:', isStepValid);
    console.log('Current step:', currentStep);
    console.log('Can proceed to next:', canProceedToNext());
  }, [isStepValid, currentStep]);

  const menuItems = [
    { 
      path: '/client/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      color: 'text-blue-600'
    },
    { 
      path: '/client/appointments', 
      icon: Calendar, 
      label: 'Appointments',
      color: 'text-green-600'
    },
    { 
      path: '/client/documents', 
      icon: FileText, 
      label: 'Documents',
      color: 'text-purple-600'
    },
    { 
      path: '/client/billing', 
      icon: CreditCard, 
      label: 'Billing',
      color: 'text-orange-600'
    },
    { 
      path: '/client/activity', 
      icon: Activity, 
      label: 'Activity',
      color: 'text-pink-600'
    },
    { 
      path: '/client/settings', 
      icon: Settings, 
      label: 'Settings',
      color: 'text-gray-600'
    },
  ];

  const handleLogout = async () => {
    console.log('ClientDashboard logout button clicked');
    try {
      await logout({
        showNotification: true,
        reason: 'user_initiated',
        redirectPath: '/login'
      });
    } catch (error) {
      console.error('Logout failed in ClientDashboard:', error);
      window.location.href = '/login';
    }
  };

  // Step navigation functions
  const canNavigateToStep = (stepIndex: number) => {
    if (stepIndex === 0) return true;
    return completedSteps.has(stepIndex - 1);
  };

  const canProceedToNext = () => {
    const step = workflowSteps[currentStep];
    const stepFields = stepData[step.id] || {};
    
    // Check validation in real-time instead of relying on state
    let isValid = true;
    if (step.required) {
      for (const field of step.fields) {
        const fieldValue = stepFields[field];
        if (!fieldValue || fieldValue === '' || fieldValue.trim() === '') {
          isValid = false;
          break;
        }
      }
    }
    
    console.log('canProceedToNext check:');
    console.log('- Step:', step.id);
    console.log('- Required:', step.required);
    console.log('- Step fields:', stepFields);
    console.log('- Real-time valid:', isValid);
    console.log('- State valid:', isStepValid[currentStep]);
    console.log('- Final result:', isValid || !step.required);
    
    return isValid || !step.required;
  };

  const handleStepComplete = () => {
    console.log('handleStepComplete called');
    console.log('Current step:', currentStep);
    console.log('Can proceed to next:', canProceedToNext());
    console.log('isStepValid[currentStep]:', isStepValid[currentStep]);
    console.log('workflowSteps[currentStep].required:', workflowSteps[currentStep].required);
    
    if (canProceedToNext()) {
      console.log('Proceeding to next step');
      const newCompletedSteps = new Set(completedSteps);
      newCompletedSteps.add(currentStep);
      setCompletedSteps(newCompletedSteps);
      
      if (currentStep < workflowSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        console.log('All steps completed!');
      }
    } else {
      console.log('Cannot proceed - validation failed');
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepDataChange = (field: string, value: any) => {
    const newStepData = {
      ...stepData,
      [workflowSteps[currentStep].id]: {
        ...stepData[workflowSteps[currentStep].id],
        [field]: value
      }
    };
    
    setStepData(newStepData);
    
    // Validate immediately with the new data
    const step = workflowSteps[currentStep];
    const stepFields = newStepData[step.id] || {};
    
    let isValid = true;
    if (step.required) {
      for (const field of step.fields) {
        const fieldValue = stepFields[field];
        if (!fieldValue || fieldValue === '' || fieldValue.trim() === '') {
          isValid = false;
          console.log(`Field ${field} is invalid:`, fieldValue);
          break;
        }
      }
    }
    
    setIsStepValid(prev => ({
      ...prev,
      [currentStep]: isValid
    }));
    
    console.log('Immediate validation - Step:', step.id, 'Valid:', isValid);
  };

  const validateCurrentStep = () => {
    const step = workflowSteps[currentStep];
    const stepFields = stepData[step.id] || {};
    
    let isValid = true;
    if (step.required) {
      for (const field of step.fields) {
        const fieldValue = stepFields[field];
        if (!fieldValue || fieldValue === '' || fieldValue.trim() === '') {
          isValid = false;
          console.log(`Field ${field} is invalid:`, fieldValue);
          break;
        }
      }
    }
    
    setIsStepValid(prev => ({
      ...prev,
      [currentStep]: isValid
    }));
    
    // Debug logging
    console.log('Validating step:', step.id, 'Fields:', stepFields, 'Valid:', isValid);
    console.log('Required fields:', step.fields);
    console.log('Field values:', step.fields.map(field => `${field}: ${stepFields[field]}`));
  };

  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.has(stepIndex)) return 'completed';
    if (stepIndex === currentStep) return 'active';
    if (canNavigateToStep(stepIndex)) return 'available';
    return 'locked';
  };

  // Step components
  const ProfileStep = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Profile Information</h3>
        <p className="text-blue-700 text-sm md:text-base">Complete your personal and professional details</p>
      </div>
      
      {/* Debug Info */}
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Debug Info:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>Current Step: {currentStep}</p>
          <p>Step Valid (State): {isStepValid[currentStep] ? 'YES' : 'NO'}</p>
          <p>Can Proceed (Real-time): {canProceedToNext() ? 'YES' : 'NO'}</p>
          <p>Step Data: {JSON.stringify(stepData.profile || {})}</p>
          <button 
            onClick={() => validateCurrentStep()}
            className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Manual Validate
          </button>
        </div>
      </div>
      
      <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
            <input
              type="text"
              value={stepData.profile?.firstName || ''}
              onChange={(e) => handleStepDataChange('firstName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
            <input
              type="text"
              value={stepData.profile?.lastName || ''}
              onChange={(e) => handleStepDataChange('lastName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="Enter your last name"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            value={stepData.profile?.email || user?.email || ''}
            onChange={(e) => handleStepDataChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder="your.email@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
          <input
            type="tel"
            value={stepData.profile?.phone || ''}
            onChange={(e) => handleStepDataChange('phone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder="+1 (555) 123-4567"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Medical Specialty *</label>
          <select
            value={stepData.profile?.specialty || ''}
            onChange={(e) => handleStepDataChange('specialty', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          >
            <option value="">Select your specialty</option>
            <option value="general-practice">General Practice</option>
            <option value="cardiology">Cardiology</option>
            <option value="dermatology">Dermatology</option>
            <option value="pediatrics">Pediatrics</option>
            <option value="orthopedics">Orthopedics</option>
            <option value="psychiatry">Psychiatry</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  const PracticeStep = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-900 mb-2">Practice Information</h3>
        <p className="text-green-700">Set up your healthcare practice details</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Practice Name *</label>
          <input
            type="text"
            value={stepData.practice?.practiceName || ''}
            onChange={(e) => handleStepDataChange('practiceName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Your Medical Practice"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
          <input
            type="text"
            value={stepData.practice?.address || ''}
            onChange={(e) => handleStepDataChange('address', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="123 Medical Street, City, State 12345"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Practice Phone *</label>
          <input
            type="tel"
            value={stepData.practice?.phone || ''}
            onChange={(e) => handleStepDataChange('phone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="+1 (555) 987-6543"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">NPI Number *</label>
          <input
            type="text"
            value={stepData.practice?.npiNumber || ''}
            onChange={(e) => handleStepDataChange('npiNumber', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="1234567890"
          />
        </div>
      </div>
    </div>
  );

  const ServicesStep = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-purple-900 mb-2">Services & Specialties</h3>
        <p className="text-purple-700">Define the medical services you provide</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Services *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Consultations', 'Check-ups', 'Vaccinations', 'Lab Tests', 'X-rays', 'Ultrasound'].map(service => (
            <label key={service} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={stepData.services?.primaryServices?.includes(service) || false}
                onChange={(e) => {
                  const current = stepData.services?.primaryServices || [];
                  const updated = e.target.checked 
                    ? [...current, service]
                    : current.filter((s: string) => s !== service);
                  handleStepDataChange('primaryServices', updated);
                }}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm">{service}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Specialties *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Internal Medicine', 'Surgery', 'Pediatrics', 'Cardiology', 'Dermatology', 'Neurology'].map(specialty => (
            <label key={specialty} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={stepData.services?.specialties?.includes(specialty) || false}
                onChange={(e) => {
                  const current = stepData.services?.specialties || [];
                  const updated = e.target.checked 
                    ? [...current, specialty]
                    : current.filter((s: string) => s !== specialty);
                  handleStepDataChange('specialties', updated);
                }}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm">{specialty}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const ScheduleStep = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-orange-900 mb-2">Schedule & Availability</h3>
        <p className="text-orange-700">Set your working hours and appointment slots</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours *</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
            <div key={day} className="flex items-center space-x-3">
              <span className="w-20 text-sm font-medium">{day}</span>
              <input
                type="time"
                value={stepData.schedule?.workingHours?.[day]?.start || '09:00'}
                onChange={(e) => handleStepDataChange('workingHours', {
                  ...stepData.schedule?.workingHours,
                  [day]: { ...stepData.schedule?.workingHours?.[day], start: e.target.value }
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-sm">to</span>
              <input
                type="time"
                value={stepData.schedule?.workingHours?.[day]?.end || '17:00'}
                onChange={(e) => handleStepDataChange('workingHours', {
                  ...stepData.schedule?.workingHours,
                  [day]: { ...stepData.schedule?.workingHours?.[day], end: e.target.value }
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Types *</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { type: 'New Patient Consultation', duration: '30' },
            { type: 'Follow-up Visit', duration: '15' },
            { type: 'Annual Check-up', duration: '45' },
            { type: 'Urgent Care', duration: '20' }
          ].map(apt => (
            <label key={apt.type} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={stepData.schedule?.appointmentTypes?.includes(apt.type) || false}
                onChange={(e) => {
                  const current = stepData.schedule?.appointmentTypes || [];
                  const updated = e.target.checked 
                    ? [...current, apt.type]
                    : current.filter((t: string) => t !== apt.type);
                  handleStepDataChange('appointmentTypes', updated);
                }}
                className="text-orange-600 focus:ring-orange-500"
              />
              <div>
                <span className="text-sm font-medium">{apt.type}</span>
                <span className="text-xs text-gray-500 block">{apt.duration} min</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const BillingStep = () => (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-emerald-900 mb-2">Billing Setup</h3>
        <p className="text-emerald-700">Configure payment and insurance options</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Methods *</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Credit Card', 'Debit Card', 'Cash', 'Check'].map(method => (
            <label key={method} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={stepData.billing?.paymentMethods?.includes(method) || false}
                onChange={(e) => {
                  const current = stepData.billing?.paymentMethods || [];
                  const updated = e.target.checked 
                    ? [...current, method]
                    : current.filter((m: string) => m !== method);
                  handleStepDataChange('paymentMethods', updated);
                }}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm">{method}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Providers *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Blue Cross', 'Aetna', 'UnitedHealth', 'Cigna', 'Humana', 'Medicare'].map(insurance => (
            <label key={insurance} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={stepData.billing?.insuranceProviders?.includes(insurance) || false}
                onChange={(e) => {
                  const current = stepData.billing?.insuranceProviders || [];
                  const updated = e.target.checked 
                    ? [...current, insurance]
                    : current.filter((i: string) => i !== insurance);
                  handleStepDataChange('insuranceProviders', updated);
                }}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm">{insurance}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Patient Visit ($)</label>
          <input
            type="number"
            value={stepData.billing?.rates?.newPatient || ''}
            onChange={(e) => handleStepDataChange('rates', {
              ...stepData.billing?.rates,
              newPatient: e.target.value
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="150"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Visit ($)</label>
          <input
            type="number"
            value={stepData.billing?.rates?.followUp || ''}
            onChange={(e) => handleStepDataChange('rates', {
              ...stepData.billing?.rates,
              followUp: e.target.value
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="75"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Consultation ($)</label>
          <input
            type="number"
            value={stepData.billing?.rates?.consultation || ''}
            onChange={(e) => handleStepDataChange('rates', {
              ...stepData.billing?.rates,
              consultation: e.target.value
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="100"
          />
        </div>
      </div>
    </div>
  );

  const DocumentsStep = () => (
    <div className="space-y-6">
      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-pink-900 mb-2">Document Templates</h3>
        <p className="text-pink-700">Prepare patient forms and templates (Optional)</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Consent Forms</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['Treatment Consent', 'Privacy Policy', 'HIPAA Agreement', 'Photo Release'].map(form => (
            <label key={form} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={stepData.documents?.consentForms?.includes(form) || false}
                onChange={(e) => {
                  const current = stepData.documents?.consentForms || [];
                  const updated = e.target.checked 
                    ? [...current, form]
                    : current.filter((f: string) => f !== form);
                  handleStepDataChange('consentForms', updated);
                }}
                className="text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm">{form}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Medical History Forms</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['Patient History', 'Family History', 'Medication List', 'Allergy Information'].map(form => (
            <label key={form} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={stepData.documents?.medicalHistory?.includes(form) || false}
                onChange={(e) => {
                  const current = stepData.documents?.medicalHistory || [];
                  const updated = e.target.checked 
                    ? [...current, form]
                    : current.filter((f: string) => f !== form);
                  handleStepDataChange('medicalHistory', updated);
                }}
                className="text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm">{form}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (workflowSteps[currentStep].id) {
      case 'profile': return <ProfileStep />;
      case 'practice': return <PracticeStep />;
      case 'services': return <ServicesStep />;
      case 'schedule': return <ScheduleStep />;
      case 'billing': return <BillingStep />;
      case 'documents': return <DocumentsStep />;
      default: return <ProfileStep />;
    }
  };

  const StepProgressIndicator = () => (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Setup Your Practice</h2>
        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          Step {currentStep + 1} of {workflowSteps.length}
        </span>
      </div>
      
      {/* Mobile: Vertical Step List */}
      <div className="block sm:hidden">
        <div className="space-y-3">
          {workflowSteps.map((step, index) => {
            const status = getStepStatus(index);
            const Icon = step.icon;
            
            return (
              <div
                key={step.id}
                onClick={() => canNavigateToStep(index) && setCurrentStep(index)}
                className={`flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  status === 'completed' 
                    ? 'bg-green-50 border-green-200' 
                    : status === 'active'
                    ? 'bg-blue-50 border-blue-200'
                    : status === 'available'
                    ? 'bg-white border-gray-200 hover:border-blue-300'
                    : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-4 ${
                  status === 'completed' 
                    ? 'bg-green-600 text-white' 
                    : status === 'active'
                    ? 'bg-blue-600 text-white'
                    : status === 'available'
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {status === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium text-sm ${
                      status === 'completed' 
                        ? 'text-green-700' 
                        : status === 'active'
                        ? 'text-blue-700 font-bold'
                        : status === 'available'
                        ? 'text-gray-700'
                        : 'text-gray-500'
                    }`}>
                      {step.title}
                    </h3>
                    {step.required && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: Horizontal Progress Bar */}
      <div className="hidden sm:block">
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
          <div 
            className="absolute top-5 left-0 h-1 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((completedSteps.size + (isStepValid[currentStep] ? 1 : 0)) / workflowSteps.length) * 100}%` }}
          ></div>
          
          <div className="relative flex justify-between">
            {workflowSteps.map((step, index) => {
              const status = getStepStatus(index);
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <button
                    onClick={() => canNavigateToStep(index) && setCurrentStep(index)}
                    disabled={!canNavigateToStep(index)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                      status === 'completed' 
                        ? 'bg-green-600 text-white' 
                        : status === 'active'
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : status === 'available'
                        ? 'bg-white border-2 border-gray-300 text-gray-600 hover:border-blue-600 hover:text-blue-600'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {status === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </button>
                  <span className={`mt-2 text-xs font-medium text-center max-w-20 ${
                    status === 'completed' 
                      ? 'text-green-600' 
                      : status === 'active'
                      ? 'text-blue-600 font-bold'
                      : status === 'available'
                      ? 'text-gray-600'
                      : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 relative z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Practice Setup</h1>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="relative flex flex-col w-72 bg-white shadow-xl h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-sm text-gray-600 truncate">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Content (shown when sidebar is closed) */}
      <div className={`md:hidden ${sidebarOpen ? 'hidden' : 'block'}`}>
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <StepProgressIndicator />
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                      {workflowSteps[currentStep].title}
                    </h3>
                    <p className="text-gray-600 mt-1 text-sm md:text-base">
                      {workflowSteps[currentStep].description}
                    </p>
                  </div>
                  {workflowSteps[currentStep].required && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full self-start sm:self-auto">
                      Required
                    </span>
                  )}
                </div>
              </div>

              {renderStepContent()}

              {/* Step Navigation */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleStepBack}
                  disabled={currentStep === 0}
                  className={`flex items-center justify-center space-x-2 w-full sm:w-auto px-6 py-3 rounded-lg transition-colors ${
                    currentStep === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                  {!isStepValid[currentStep] && workflowSteps[currentStep].required && (
                    <span className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg w-full sm:w-auto text-center">
                      Please complete all required fields
                    </span>
                  )}
                  
                  {currentStep === workflowSteps.length - 1 ? (
                    <button
                      onClick={handleStepComplete}
                      disabled={!canProceedToNext()}
                      className={`flex items-center justify-center space-x-2 w-full sm:w-auto px-6 py-3 rounded-lg transition-colors ${
                        canProceedToNext()
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Complete Setup</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStepComplete}
                      disabled={!canProceedToNext()}
                      className={`flex items-center justify-center space-x-2 w-full sm:w-auto px-6 py-3 rounded-lg transition-colors ${
                        canProceedToNext()
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex">
        {/* Desktop Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
          <div className="p-6 flex-1">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">DYAD</h2>
                <p className="text-sm text-gray-600">Practice Solutions</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* User Profile Section */}
          <div className="p-6 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-600 truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Desktop Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Welcome back, {user?.name || 'User'}!</h1>
                <p className="text-gray-600">Complete your practice setup to get started.</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              <StepProgressIndicator />
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-8">
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                        {workflowSteps[currentStep].title}
                      </h3>
                      <p className="text-gray-600 mt-1 text-sm md:text-base">
                        {workflowSteps[currentStep].description}
                      </p>
                    </div>
                    {workflowSteps[currentStep].required && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full self-start sm:self-auto">
                        Required
                      </span>
                    )}
                  </div>
                </div>

                {renderStepContent()}

                {/* Step Navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleStepBack}
                    disabled={currentStep === 0}
                    className={`flex items-center justify-center space-x-2 w-full sm:w-auto px-6 py-3 rounded-lg transition-colors ${
                      currentStep === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    {!isStepValid[currentStep] && workflowSteps[currentStep].required && (
                      <span className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg w-full sm:w-auto text-center">
                        Please complete all required fields
                      </span>
                    )}
                    
                    {currentStep === workflowSteps.length - 1 ? (
                      <button
                        onClick={handleStepComplete}
                        disabled={!canProceedToNext()}
                        className={`flex items-center justify-center space-x-2 w-full sm:w-auto px-6 py-3 rounded-lg transition-colors ${
                          canProceedToNext()
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>Complete Setup</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStepComplete}
                        disabled={!canProceedToNext()}
                        className={`flex items-center justify-center space-x-2 w-full sm:w-auto px-6 py-3 rounded-lg transition-colors ${
                          canProceedToNext()
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <span>Next Step</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
