import { useI18n } from '../../../context/I18nContext';

interface OnboardingStep4NameProps {
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  errors?: { displayName?: { message?: string } };
}

export const OnboardingStep4Name = ({ displayName, onDisplayNameChange, errors }: OnboardingStep4NameProps) => {
  const { t } = useI18n();

  return (
    <form className="space-y-6">
      <div className="animate-fade-in-up">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {t.onboardingStep4Title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 animate-fade-in-up animate-delay-100">
          {t.onboardingStep4Description}
        </p>
        <div className="animate-fade-in-up animate-delay-200">
          <input
            type="text"
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            placeholder={t.displayNamePlaceholder}
            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            aria-label={t.displayNameLabel}
          />
          {errors?.displayName && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.displayName.message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
};
