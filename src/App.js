import React, { useState } from 'react';
import { Calendar, Clock, Home, Sparkles, Share2, User, Phone, MapPin } from 'lucide-react';

function App() {
  const [view, setView] = useState('cliente');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [bookings, setBookings] = useState([]);
  const [shareLink, setShareLink] = useState('');
  
  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    address: '',
    cleaningType: 'basica',
    date: '',
    time: '',
    observations: ''
  });

  const cleaningTypes = {
    basica: { name: 'Limpeza Básica', price: 'R$ 120', duration: '3h' },
    profunda: { name: 'Limpeza Profunda', price: 'R$ 250', duration: '6h' },
    pos_obra: { name: 'Pós-Obra', price: 'R$ 400', duration: '8h' },
    escritorio: { name: 'Escritório', price: 'R$ 180', duration: '4h' }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setView('prestador');
    } else {
      alert('Senha incorreta!');
    }
  };

  const generateShareLink = () => {
    const link = `${window.location.origin}`;
    setShareLink(link);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copiado! Agora você pode colar no WhatsApp');
  };

  const shareOnWhatsApp = () => {
    const message = `Olá! Agende sua limpeza comigo de forma fácil e rápida através deste link:

${shareLink}`;
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const whatsappLink = isMobile 
      ? `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
      : `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappLink, '_blank');
  };

  const handleClientSubmit = () => {
    if (!clientForm.name || !clientForm.phone || !clientForm.address || !clientForm.date || !clientForm.time) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    const newBooking = {
      id: Date.now(),
      ...clientForm,
      status: 'pendente',
      createdAt: new Date().toISOString()
    };
    setBookings([...bookings, newBooking]);
    alert('Agendamento enviado com sucesso! O prestador entrará em contato em breve.');
    setClientForm({
      name: '',
      phone: '',
      address: '',
      cleaningType: 'basica',
      date: '',
      time: '',
      observations: ''
    });
  };

  const updateBookingStatus = (id, newStatus) => {
    setBookings(bookings.map(b => 
      b.id === id ? { ...b, status: newStatus } : b
    ));
  };

  // Tela de Login do Prestador
  if (!isAdmin && view === 'prestador') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-indigo-600 p-4 rounded-full">
              <Sparkles className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Acesso do Prestador</h1>
          <p className="text-gray-600 text-center mb-6">Digite sua senha para acessar o painel</p>
          
          <div className="space-y-4">
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              placeholder="Senha"
            />
            <button
              onClick={handleAdminLogin}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Entrar
            </button>
            <button
              onClick={() => setView('cliente')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Voltar para Agendamento
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-6">
            Senha padrão: admin123
          </p>
        </div>
      </div>
    );
  }

  // Painel do Prestador
  if (isAdmin && view === 'prestador') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-3 rounded-full">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Painel do Prestador</h1>
                  <p className="text-gray-600">Maria Silva - Serviços de Limpeza</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAdmin(false);
                  setView('cliente');
                  setAdminPassword('');
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Sair
              </button>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={generateShareLink}
                className="w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-indigo-600 transition"
              >
                <Share2 size={20} />
                Gerar Link de Agendamento
              </button>
              
              {shareLink && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-indigo-800 font-medium mb-2">Seu link de agendamento:</p>
                  <p className="text-xs text-indigo-700 break-all mb-3">{shareLink}</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={copyLink}
                      className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                    >
                      📋 Copiar Link
                    </button>
                    <button
                      onClick={shareOnWhatsApp}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition text-sm font-medium"
                    >
                      📱 WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={24} />
              Agendamentos Recebidos ({bookings.length})
            </h2>
            
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nenhum agendamento ainda</p>
                <p className="text-sm">Compartilhe seu link para receber solicitações</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <User size={18} className="text-indigo-600" />
                          <span className="font-semibold text-gray-800">{booking.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            booking.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone size={16} />
                            <span>{booking.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Home size={16} />
                            <span>{cleaningTypes[booking.cleaningType].name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{new Date(booking.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>{booking.time}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-start gap-2 text-sm text-gray-600">
                          <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                          <span>{booking.address}</span>
                        </div>
                        
                        {booking.observations && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                            <strong>Observações:</strong> {booking.observations}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {booking.status === 'pendente' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'confirmado')}
                          className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition text-sm font-medium"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'recusado')}
                          className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium"
                        >
                          Recusar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tela do Cliente (padrão)
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-600 p-3 rounded-full">
              <Sparkles className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">Agende sua Limpeza</h1>
              <p className="text-gray-600">Maria Silva - Serviços de Limpeza</p>
            </div>
            <button
              onClick={() => setView('prestador')}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Acesso Prestador
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {Object.entries(cleaningTypes).map(([key, type]) => (
            <div
              key={key}
              onClick={() => setClientForm({ ...clientForm, cleaningType: key })}
              className={`bg-white rounded-lg p-4 cursor-pointer transition border-2 ${
                clientForm.cleaningType === key
                  ? 'border-purple-600 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{type.name}</h3>
                <input
                  type="radio"
                  checked={clientForm.cleaningType === key}
                  readOnly
                  className="mt-1"
                />
              </div>
              <p className="text-sm text-gray-600">Duração: {type.duration}</p>
              <p className="text-lg font-bold text-purple-600 mt-1">{type.price}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Dados do Agendamento</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone/WhatsApp *
              </label>
              <input
                type="tel"
                value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço Completo *
              </label>
              <input
                type="text"
                value={clientForm.address}
                onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Rua, número, bairro, cidade"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  value={clientForm.date}
                  onChange={(e) => setClientForm({ ...clientForm, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário *
                </label>
                <input
                  type="time"
                  value={clientForm.time}
                  onChange={(e) => setClientForm({ ...clientForm, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={clientForm.observations}
                onChange={(e) => setClientForm({ ...clientForm, observations: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                rows="3"
                placeholder="Alguma informação adicional? (opcional)"
              />
            </div>
          </div>

          <button
            onClick={handleClientSubmit}
            className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
          >
            <Calendar size={20} />
            Solicitar Agendamento
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Após o envio, o prestador entrará em contato para confirmar
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;