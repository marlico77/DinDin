import { z } from 'zod';
import { UserPlus } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

const inviteMemberSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['EDITOR', 'VIEWER']),
});

type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

interface InviteMemberFormProps {
  onSubmit: (data: InviteMemberFormData) => void;
  isSubmitting: boolean;
  errors: any;
  isAtMemberLimit: boolean;
  maxMembers: number;
  currentCount: number;
  register: any;
  handleSubmit: any;
}

export const InviteMemberForm = ({
  onSubmit,
  isSubmitting,
  errors,
  isAtMemberLimit,
  maxMembers,
  currentCount,
  register,
  handleSubmit,
}: InviteMemberFormProps) => {
  const { t } = useI18n();

  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-4 flex items-center">
        <UserPlus className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
        {t.inviteNewMember}
      </h4>
      
      {isAtMemberLimit ? (
        <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                {t.planLimitReached}
              </p>
              <p className="text-xs font-light text-yellow-600 dark:text-yellow-400 mt-1">
                {t.currentPlanSupportsUpTo.replace('{{max}}', String(maxMembers)).replace('{{current}}', String(currentCount)).replace('{{currentLabel}}', currentCount === 1 ? 'membro' : 'membros').replace('{{currentPlural}}', currentCount === 1 ? '' : 's')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <p className="text-xs font-light text-gray-400 dark:text-gray-500 -mt-2 mb-1">
            {t.inviteMemberHint}
          </p>
          <div>
            <label htmlFor="email" className="block text-sm font-light text-gray-500 dark:text-gray-400 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={`block w-full px-3 py-2.5 border rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 sm:text-sm font-light tracking-tight ${
                errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-800'
              }`}
              placeholder="exemplo@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm font-light text-red-500 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-light text-gray-500 dark:text-gray-400 mb-2">
              Permissão
            </label>
            <select
              id="role"
              {...register('role')}
              className="block w-full px-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 sm:text-sm font-light tracking-tight"
            >
              <option value="EDITOR">{t.editor}</option>
              <option value="VIEWER">{t.viewer}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 text-sm font-light tracking-tight text-white bg-primary-600 dark:bg-primary-500 border border-primary-600 dark:border-primary-500 rounded-md hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t.loading : t.create}
          </button>
        </form>
      )}
    </div>
  );
};
