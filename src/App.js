import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Home, Sparkles, Share2, User, Phone, MapPin, ChevronLeft, ChevronRight, CheckCircle, XCircle, Coffee, UtensilsCrossed, Info, FileText } from 'lucide-react';

function App() {
  const [view, setView] = useState('cliente');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('cleaning_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentProfessional, setCurrentProfessional] = useState(0);

  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    address: '',
    professionalId: 0,
    cleaningType: 'basica',
    date: '',
    provideMeal: 'nenhum',
    housePreparation: '',
    observations: ''
  });

  useEffect(() => {
    localStorage.setItem('cleaning_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const professionals = [
    { id: 0, name: 'Maria Silva', specialty: 'Limpeza Residencial', experience: '10 anos', rating: 4.9, color: 'purple' },
    { id: 1, name: 'João Santos', specialty: 'Pós-Obra', experience: '8 anos', rating: 4.8, color: 'blue' },
    { id: 2, name: 'Ana Costa', specialty: 'Limpeza Profunda', experience: '12 anos', rating: 5.0, color: 'green' },
    { id: 3, name: 'Carlos Mendes', specialty: 'Escritórios', experience: '6 anos', rating: 4.7, color: 'orange' }
  ];

  const cleaningTypes = {
    basica: {
      name: 'Limpeza Básica',
      price: 'R$ 120',
      duration: 7,
      description: 'Apartamento ou casa padrão',
      surfaces: ['2 Quartos', '1 Banheiro', 'Cozinha', 'lavanderia', ' Sala']
    },
    profunda: {
      name: 'Limpeza Profunda',
      price: 'R$ 250',
      duration: 6,
      description: 'Limpeza completa e detalhada',
      surfaces: ['Básica +', 'Vidros', 'Azulejos', 'Rodapés']
    },
    pos_obra: {
      name: 'Pós-Obra',
      price: 'R$ 400',
      duration: 8,
      description: 'Após reforma ou construção',
      surfaces: ['Pó de obra', 'Cimento', 'Pisos', 'Janelas']
    },
    escritorio: {
      name: 'Escritório',
      price: 'R$ 180',
      duration: 4,
      description: 'Ambiente comercial',
      surfaces: ['Estações', 'Carpetes', 'Copa', 'Banheiros']
    },
    orcamento: {
      name: 'Solicitar Orçamento',
      price: 'A combinar',
      duration: 0,
      description: 'Serviço personalizado para grandes áreas',
      surfaces: ['Personalizado']
    }
  };

  const mealOptions = [
    { value: 'nenhum', label: 'Não oferecerei refeição' },
    { value: 'cafe', label: 'Café da manhã' },
    { value: 'almoco', label: 'Almoço' },
    { value: 'ambos', label: 'Café e almoço' }
  ];

  const checkAvailability = (professionalId, date) => {
    if (!date) return { available: true, message: 'Selecione uma data' };
    const dt = new Date(date + 'T00:00:00');
    const day = dt.getDay();
    if (day === 0 || day === 6) return { available: false, message: 'Atendemos apenas de segunda a sexta' };
    const conflicts = bookings.filter(b => b.professionalId === professionalId && b.date === date && b.status !== 'recusado');
    if (conflicts.length > 0) return { available: false, message: 'Profissional ocupado nesta data' };
    return { available: true, message: '✓ Data disponível! Horário: 8h30 às 17h30' };
  };

  const availability = clientForm.cleaningType !== 'orcamento' 
    ? checkAvailability(clientForm.professionalId, clientForm.date) 
    : { available: true, message: 'Orçamento sob consulta' };

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') { setIsAdmin(true); setView('prestador'); } 
    else { alert('Senha incorreta!'); }
  };

  const handleClientSubmit = () => {
    if (!clientForm.name || !clientForm.phone || !clientForm.address || !clientForm.date) {
      alert('Preencha os campos obrigatórios!'); return;
    }
    const newBooking = {
      id: Date.now(),
      ...clientForm,
      professionalName: professionals[clientForm.professionalId].name,
      status: 'pendente'
    };
    setBookings([...bookings, newBooking]);
    alert('Solicitação enviada com sucesso!');
    setClientForm({ ...clientForm, name: '', phone: '', address: '', date: '', housePreparation: '', observations: '' });
  };

  const selectedProfessional = professionals[currentProfessional];

  if (!isAdmin && view === 'prestador') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-xl font-bold mb-4 text-center">Acesso do Prestador</h1>
          <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-2 border rounded mb-4" placeholder="Senha" />
          <button onClick={handleAdminLogin} className="w-full bg-indigo-600 text-white py-2 rounded mb-2 font-bold">Entrar</button>
          <button onClick={() => setView('cliente')} className="w-full text-gray-500 text-sm">Voltar ao Agendamento</button>
        </div>
      </div>
    );
  }

  if (isAdmin && view === 'prestador') {
    return (
      <div className="min-h-screen bg-blue-50 p-4 font-sans text-base">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">Painel de Gestão</h1>
            <button onClick={() => {setIsAdmin(false); setView('cliente');}} className="bg-red-500 text-white px-4 py-2 rounded-lg">Sair</button>
          </div>
          <div className="space-y-4">
            {bookings.length === 0 && <p className="text-center text-gray-500 py-10">Nenhum agendamento recebido.</p>}
            {bookings.map(b => (
              <div key={b.id} className="bg-white p-6 rounded-xl shadow-sm border-l-8 border-indigo-600">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{b.name}</h3>
                    <p className="text-indigo-600 font-bold">{cleaningTypes[b.cleaningType].name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${b.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {b.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700 mb-4">
                  <p><strong>📅 Data:</strong> {b.date}</p>
                  <p><strong>👤 Profissional:</strong> {b.professionalName}</p>
                  <p><strong>📞 WhatsApp:</strong> {b.phone}</p>
                  <p><strong>📍 Endereço:</strong> {b.address}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg italic text-gray-600 border border-gray-100">
                  <strong>Preparação:</strong> {b.housePreparation || "Nenhuma observação"}
                </div>
                {b.status === 'pendente' && (
                  <div className="flex gap-4 mt-6">
                    <button onClick={() => setBookings(bookings.map(x => x.id === b.id ? {...x, status: 'confirmado'} : x))} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">Confirmar</button>
                    <button onClick={() => setBookings(bookings.map(x => x.id === b.id ? {...x, status: 'recusado'} : x))} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold">Recusar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-base">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-indigo-600 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Agende sua Limpeza</h1>
            <p className="text-gray-500">Serviços profissionais e confiáveis</p>
          </div>
          <button onClick={() => setView('prestador')} className="text-sm text-gray-400 hover:text-indigo-600 underline">Acesso</button>
        </div>

        {/* 1. Profissional */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><User /> 1. Escolha o Profissional</h2>
          <div className="flex items-center gap-4 border-2 border-gray-100 p-6 rounded-2xl bg-gray-50">
            <button onClick={() => setCurrentProfessional((currentProfessional - 1 + professionals.length) % professionals.length)} className="p-2 hover:bg-white rounded-full shadow-sm bg-white"><ChevronLeft /></button>
            <div className="flex-1 text-center">
              <div className="w-20 h-20 mx-auto rounded-full mb-3 bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">{selectedProfessional.name[0]}</div>
              <h3 className="font-bold text-lg">{selectedProfessional.name}</h3>
              <p className="text-indigo-600 font-bold">{selectedProfessional.specialty}</p>
              <p className="text-gray-500 mt-1">{selectedProfessional.experience} • {selectedProfessional.rating} ★</p>
            </div>
            <button onClick={() => setCurrentProfessional((currentProfessional + 1) % professionals.length)} className="p-2 hover:bg-white rounded-full shadow-sm bg-white"><ChevronRight /></button>
          </div>
        </div>

        {/* 2. Tipo de Limpeza */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Sparkles /> 2. Tipo de Limpeza</h2>
          <div className="grid gap-4">
            {Object.entries(cleaningTypes).map(([key, type]) => (
              <label key={key} className={`border-2 p-5 rounded-2xl cursor-pointer transition-all ${clientForm.cleaningType === key ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}>
                <input type="radio" className="hidden" name="cleaning" value={key} checked={clientForm.cleaningType === key} onChange={() => setClientForm({...clientForm, cleaningType: key})} />
                <div className="flex justify-between font-bold text-gray-800 text-lg">
                  <span>{type.name}</span>
                  <span>{type.price}</span>
                </div>
                <p className="text-gray-500 mb-3">{type.description}</p>
                <div className="flex flex-wrap gap-2">
                  {type.surfaces.map((s, i) => (
                    <span key={i} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-600 flex items-center gap-1"><CheckCircle size={14}/> {s}</span>
                  ))}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 3. Formulário */}
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2"><FileText /> 3. Dados do Agendamento</h2>
          
          <div className="space-y-4">
            <input type="text" placeholder="Seu Nome Completo" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            <input type="tel" placeholder="Seu WhatsApp (DDD)" value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            <input type="text" placeholder="Endereço de Atendimento (Rua, Número, Bairro)" value={clientForm.address} onChange={e => setClientForm({...clientForm, address: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-2">Data do Serviço (Segunda a Sexta)</label>
            <input type="date" value={clientForm.date} onChange={e => setClientForm({...clientForm, date: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            <div className={`mt-3 p-4 rounded-xl font-bold ${availability.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {availability.message}
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-2">Refeição do Prestador</label>
            <div className="flex flex-wrap gap-3">
              {mealOptions.map(opt => (
                <button key={opt.value} onClick={() => setClientForm({...clientForm, provideMeal: opt.value})} className={`px-5 py-2 rounded-full border-2 transition ${clientForm.provideMeal === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'}`}>{opt.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-2">Preparação da Casa *</label>
            <textarea placeholder="Ex: Deixarei os produtos no tanque, a chave está na portaria, tenho um pet no quintal..." value={clientForm.housePreparation} onChange={e => setClientForm({...clientForm, housePreparation: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" rows="3" />
          </div>

          <button onClick={handleClientSubmit} disabled={!availability.available} className={`w-full py-5 rounded-2xl text-white font-bold text-xl shadow-xl transition-all ${availability.available ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95' : 'bg-gray-300 cursor-not-allowed'}`}>
            {clientForm.cleaningType === 'orcamento' ? 'Solicitar Orçamento' : 'Confirmar Agendamento'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;