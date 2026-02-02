import type { Category } from '../types';

interface CategoryManagerProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#EC4899', '#14B8A6', '#F97316'
];

export default function CategoryManager({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory
}: CategoryManagerProps) {
  const handleAddCategory = () => {
    const name = prompt('Enter category name:');
    if (name && name.trim()) {
      onAddCategory(name.trim());
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">Categories</h3>
        <button
          onClick={handleAddCategory}
          className="text-blue-600 hover:text-blue-700 text-xl font-bold"
          title="Add category"
        >
          +
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Tasks
        </button>
        
        {categories.map((category) => (
          <div key={category.id} className="relative group">
            <button
              onClick={() => onSelectCategory(category.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'text-white'
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: selectedCategory === category.id ? category.color : `${category.color}30`,
                color: selectedCategory === category.id ? 'white' : category.color
              }}
            >
              {category.name}
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete category "${category.name}"?`)) {
                  onDeleteCategory(category.id);
                }
              }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export { PRESET_COLORS };
