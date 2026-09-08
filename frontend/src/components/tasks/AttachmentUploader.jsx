import { Upload, X, Paperclip } from 'lucide-react';

const AttachmentUploader = ({ onUpload, isDarkMode, onClose }) => {
  const handleChange = (e) => { if (e.target.files && e.target.files[0]) onUpload(e.target.files[0]); };

  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-xl shadow-xl max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center p-4 border-b"><h2 className="font-semibold">Subir archivo</h2><button onClick={onClose}><X size={18} /></button></div>
          <div className="p-4"><div className="border-2 border-dashed rounded-lg p-8 text-center"><Upload className="mx-auto mb-2 text-gray-400" size={32} /><p className="text-sm text-gray-500">Haz clic para seleccionar</p><input type="file" onChange={handleChange} className="hidden" id="file-upload" /><label htmlFor="file-upload" className="mt-2 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm cursor-pointer">Seleccionar</label></div></div>
        </div>
      </div>
    );
  }
  return <div className="mt-2"><label className="flex items-center gap-1 text-xs text-indigo-500 cursor-pointer"><Paperclip size={10} /> Adjuntar<input type="file" onChange={handleChange} className="hidden" /></label></div>;
};

export default AttachmentUploader;