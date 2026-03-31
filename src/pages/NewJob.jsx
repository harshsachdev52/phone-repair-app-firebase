import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function NewJob() {
  const { addJob, jobs } = useStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    customerName: '',
    whatsapp: '',
    alternateNumber: '',
    brand: '',
    model: '',
    imei: '',
    problem: '',
    quotedPrice: ''
  });
  const [approved, setApproved] = useState(false);
  const [generatedJob, setGeneratedJob] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, customerName: value });
    
    if (value.trim().length > 0) {
      const match = value.toLowerCase();
      const matchedJobs = jobs.filter(
        (job) => job.customerName.toLowerCase().includes(match)
      );
      
      const uniqueCustomers = [];
      const seenNames = new Set();
      matchedJobs.forEach(job => {
        const nameLower = job.customerName.toLowerCase();
        if (!seenNames.has(nameLower)) {
          seenNames.add(nameLower);
          uniqueCustomers.push({
            customerName: job.customerName,
            whatsapp: job.whatsapp || '',
            alternateNumber: job.alternateNumber || ''
          });
        }
      });

      setSuggestions(uniqueCustomers);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (customer) => {
    setFormData({
      ...formData,
      customerName: customer.customerName,
      whatsapp: customer.whatsapp,
      alternateNumber: customer.alternateNumber
    });
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!approved) {
      alert('Customer must approve the repair before generating a job sheet.');
      return;
    }
    const newId = addJob(formData);
    setGeneratedJob({ ...formData, id: newId });
  };

  const handleWhatsAppShare = () => {
    if (!generatedJob) return;
    const text = `Hello ${generatedJob.customerName},\n\nYour repair job has been registered.\nJob Sheet: ${generatedJob.id}\nDevice: ${generatedJob.brand} ${generatedJob.model}\nIMEI/Serial: ${generatedJob.imei || 'N/A'}\nProblem: ${generatedJob.problem}\nQuoted Price: ₹${generatedJob.quotedPrice}\n\nWe will notify you once the repair is complete.\n\nThink Privacy First | Phonefix`;
    window.open(`https://wa.me/${generatedJob.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (generatedJob) {
    return (
      <div className="card max-w-2xl mx-auto">
        <h2 className="text-2xl text-success font-bold mb-4">Job Sheet Generated!</h2>
        <div className="mb-6 p-4 rounded border" style={{backgroundColor: '#f8fafc', borderColor: '#e2e8f0'}}>
          <div className="grid grid-cols-2 gap-4">
            <div><strong>Job Sheet No:</strong> {generatedJob.id}</div>
            <div><strong>Customer:</strong> {generatedJob.customerName}</div>
            <div><strong>WhatsApp:</strong> {generatedJob.whatsapp}</div>
            <div><strong>Alt Number:</strong> {generatedJob.alternateNumber || 'N/A'}</div>
            <div><strong>Device:</strong> {generatedJob.brand} {generatedJob.model}</div>
            <div><strong>IMEI / Serial No:</strong> {generatedJob.imei || 'N/A'}</div>
            <div><strong>Quoted Price:</strong> ₹{generatedJob.quotedPrice}</div>
            <div className="col-span-2"><strong>Problem:</strong> {generatedJob.problem}</div>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-primary" onClick={handleWhatsAppShare}>
            Share via WhatsApp
          </button>
          <button className="btn btn-outline" onClick={() => window.print()}>
            Print Job Sheet
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/jobs')}>
            Go to All Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Job Intake</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label">Customer Name</label>
          <input 
            type="text" 
            className="form-control" 
            required 
            value={formData.customerName} 
            onChange={handleNameChange}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => setShowSuggestions(false)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto mt-1" style={{borderColor: '#e2e8f0', top: '100%', left: 0}}>
              {suggestions.map((s, idx) => (
                <li 
                  key={idx} 
                  className="p-2 cursor-pointer hover:bg-slate-100 border-b last:border-0" 
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent input blur from firing before click
                    handleSuggestionClick(s);
                  }}
                  style={{borderColor: '#e2e8f0'}}
                >
                  <div className="font-semibold">{s.customerName}</div>
                  <div className="text-xs text-slate-500">{s.whatsapp} {s.alternateNumber ? `/ ${s.alternateNumber}` : ''}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="form-group mb-0">
            <label className="form-label">WhatsApp Number</label>
            <input type="text" className="form-control" required value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
          </div>
          <div className="form-group mb-0">
            <label className="form-label">Alternate Number (Optional)</label>
            <input type="text" className="form-control" value={formData.alternateNumber} onChange={e => setFormData({...formData, alternateNumber: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="form-group mb-0">
            <label className="form-label">Brand</label>
            <input type="text" className="form-control" required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
          </div>
          <div className="form-group mb-0">
            <label className="form-label">Model</label>
            <input type="text" className="form-control" required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
          </div>
        </div>
        <div className="form-group mb-4">
          <label className="form-label">IMEI / Serial No</label>
          <input type="text" className="form-control" value={formData.imei} onChange={e => setFormData({...formData, imei: e.target.value})} placeholder="Optional but recommended" />
        </div>
        <div className="form-group">
          <label className="form-label">Problem Description</label>
          <textarea className="form-control" rows="3" required value={formData.problem} onChange={e => setFormData({...formData, problem: e.target.value})}></textarea>
        </div>
        <div className="form-group">
          <label className="form-label">Quoted Price (₹)</label>
          <input type="number" className="form-control" required value={formData.quotedPrice} onChange={e => setFormData({...formData, quotedPrice: e.target.value})} />
        </div>
        
        <div className="form-group flex items-center gap-2 mt-6 p-4 border rounded" style={{backgroundColor: '#f8fafc', borderColor: '#e2e8f0'}}>
          <input type="checkbox" id="approved" checked={approved} onChange={(e) => setApproved(e.target.checked)} style={{width: '1rem', height: '1rem', cursor: 'pointer'}} />
          <label htmlFor="approved" className="font-bold cursor-pointer">Customer has approved the repair & quote</label>
        </div>

        <div className="mt-6">
          <button type="submit" className="btn btn-primary" disabled={!approved}>
            Generate Job Sheet
          </button>
        </div>
      </form>
    </div>
  );
}
