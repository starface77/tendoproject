import { FiGrid, FiList } from 'react-icons/fi'

const ViewToggle = ({ view, onChange }) => {
  const viewOptions = [
    { value: 'grid', icon: FiGrid, label: 'Сетка' },
    { value: 'list', icon: FiList, label: 'Список' }
  ]

  return (
    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
      {viewOptions.map((option) => {
        const IconComponent = option.icon
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-3 py-2 text-sm font-medium transition-colors flex items-center space-x-1 ${
              view === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title={option.label}
          >
            <IconComponent className="w-4 h-4" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default ViewToggle




