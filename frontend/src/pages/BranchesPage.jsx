import { useState, useEffect } from 'react';
import { Plus, Building2, Edit, Trash2, Search, X, Check } from 'lucide-react';
import branchService from '../services/branchService';

export default function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [formData, setFormData] = useState({
    name: '', code: '', address: '', city: '', phone: '',
    manager_name: '', manager_phone: '', manager_email: '', status: 'active'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = branches.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.city && b.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.manager_name && b.manager_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredBranches(filtered);
    } else {
      setFilteredBranches(branches);
    }
  }, [searchTerm, branches]);

  const loadData = async () => {
    try {
      const [branchesData, statsData] = await Promise.all([
        branchService.getAll(),
        branchService.getStats()
      ]);
      setBranches(branchesData);
      setFilteredBranches(branchesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await branchService.update(editingBranch.id, formData);
      } else {
        await branchService.create(formData);
      }
      setShowForm(false);
      setEditingBranch(null);
      setFormData({ name: '', code: '', address: '', city: '', phone: '', manager_name: '', manager_phone: '', manager_email: '', status: 'active' });
      loadData();
    } catch (error) {
      console.error('Error saving branch:', error);
      alert('Error al guardar la sucursal');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta sucursal?')) {
      try {
        await branchService.delete(id);
        loadData();
      } catch (error) {
        alert('Error al eliminar la sucursal');
      }
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData(branch);
    setShowForm(true);
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', label: 'Activa' },
      maintenance: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300', label: 'Mantenimiento' },
      closed: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', label: 'Cerrada' }
    };
    const c = config[status] || config.active;
    return <span className={`px-2 py-1 rounded-full text-xs ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Cargando sucursales...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Sucursales
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gestión de sedes y ubicaciones</p>
        </div>
        <button
          onClick={() => {
            setEditingBranch(null);
            setFormData({ name: '', code: '', address: '', city: '', phone: '', manager_name: '', manager_phone: '', manager_email: '', status: 'active' });
            setShowForm(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={18} />
          Nueva Sucursal
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Sucursales</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Activas</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.maintenance || 0}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">En Mantenimiento</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.closed || 0}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Cerradas</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nombre, ciudad o gerente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Branches Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="text-left p-3 text-slate-600 dark:text-slate-300">Nombre</th>
                <th className="text-left p-3 text-slate-600 dark:text-slate-300">Código</th>
                <th className="text-left p-3 text-slate-600 dark:text-slate-300">Ciudad</th>
                <th className="text-left p-3 text-slate-600 dark:text-slate-300">Gerente</th>
                <th className="text-left p-3 text-slate-600 dark:text-slate-300">Teléfono</th>
                <th className="text-left p-3 text-slate-600 dark:text-slate-300">Estado</th>
                <th className="text-left p-3 text-slate-600 dark:text-slate-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map(branch => (
                <tr key={branch.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                  <td className="p-3 font-medium text-slate-800 dark:text-white">{branch.name}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{branch.code || '-'}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{branch.city || '-'}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{branch.manager_name || '-'}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{branch.phone || '-'}</td>
                  <td className="p-3">{getStatusBadge(branch.status)}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(branch)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(branch.id)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBranches.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No hay sucursales registradas</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Crear primera sucursal
          </button>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <input
                type="text"
                placeholder="Nombre *"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Código"
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
                className="input"
              />
              <input
                type="text"
                placeholder="Dirección"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="input"
              />
              <input
                type="text"
                placeholder="Ciudad"
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
                className="input"
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="input"
              />
              <input
                type="text"
                placeholder="Nombre del Gerente"
                value={formData.manager_name}
                onChange={e => setFormData({...formData, manager_name: e.target.value})}
                className="input"
              />
              <input
                type="text"
                placeholder="Teléfono del Gerente"
                value={formData.manager_phone}
                onChange={e => setFormData({...formData, manager_phone: e.target.value})}
                className="input"
              />
              <input
                type="email"
                placeholder="Email del Gerente"
                value={formData.manager_email}
                onChange={e => setFormData({...formData, manager_email: e.target.value})}
                className="input"
              />
              <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="input"
              >
                <option value="active">Activa</option>
                <option value="maintenance">En Mantenimiento</option>
                <option value="closed">Cerrada</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}