import { Share2 } from 'lucide-react';

interface AccountSharingToggleProps {
  isSharing: boolean;
  onToggle: (value: boolean) => void;
  sharedHouseholdName: string;
}

export const AccountSharingToggle = ({
  isSharing,
  onToggle,
  sharedHouseholdName,
}: AccountSharingToggleProps) => {
  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="shareAccount"
          checked={isSharing}
          onChange={(e) => onToggle(e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="shareAccount" className="flex items-center space-x-2 cursor-pointer">
          <Share2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Compartilhar esta conta com {sharedHouseholdName}
          </span>
        </label>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Ao compartilhar, outros membros da household compartilhada poderão usar esta conta para dividir despesas.
      </p>
    </div>
  );
};
