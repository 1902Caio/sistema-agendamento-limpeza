import React, { useState, useEffect } from 'react';
import { Sparkles, User, ChevronLeft, ChevronRight, CheckCircle, FileText } from 'lucide-react';

function App() {
  // Navegação principal
  const [view, setView] = useState('cliente'); // 'cliente' | 'prestador'

  // Prestador
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // Cliente (auth)
  const [isClientLogged, setIsClientLogged] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register' | 'forgot'
  const [clientLogin, setClientLogin] = useState({ phone: '', password: '', email: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', phone: '', password: '', email: '' });

  // Dados persistidos
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('clients');
    return saved ? JSON.parse(saved) : [];
  });
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('cleaning_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado da área do cliente
  const [clientTab, setClientTab] = useState('agendamento'); // 'agendamento' | 'perfil'
  const [currentProfessional, setCurrentProfessional] = useState(0);

  // Formulário do cliente (perfil + agendamento)
  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
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
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [bookings, clients]);

  // Catálogos
  const professionals = [
    { id: 0, name: 'Maria Silva', specialty: 'Limpeza Residencial', experience: '10 anos' },
    { id: 1, name: 'João Santos', specialty: 'Pós-Obra', experience: '8 anos' },
    { id: 2, name: 'Ana Costa', specialty: 'Limpeza Profunda', experience: '12 anos' },
    { id: 3, name: 'Carlos Mendes', specialty: 'Escritórios', experience: '6 anos' }
  ];

  const cleaningTypes = {
    basica: { name: 'Limpeza Básica', price: 'R$ 120', description: 'Apartamento ou casa padrão', surfaces: ['2 Quartos','1 Banheiro','Cozinha','Lavanderia','Sala'] },
    profunda: { name: 'Limpeza Profunda', price: 'R$ 250', description: 'Limpeza completa e detalhada', surfaces: ['Vidros','Azulejos','Rodapés'] },
    pos_obra: { name: 'Pós-Obra', price: 'R$ 400', description: 'Após reforma ou construção', surfaces: ['Pó de obra','Cimento','Pisos','Janelas'] },
    escritorio: { name: 'Escritório', price: 'R$ 180', description: 'Ambiente comercial', surfaces: ['Estações','Carpetes','Copa','Banheiros'] },
    orcamento: { name: 'Solicitar Orçamento', price: 'A combinar', description: 'Serviço personalizado para grandes áreas', surfaces: ['Personalizado'] }
  };

  const mealOptions = [
    { value: 'nenhum', label: 'Não oferecerei refeição' },
    { value: 'cafe', label: 'Café da manhã' },
    { value: 'almoco', label: 'Almoço' },
    { value: 'ambos', label: 'Café e almoço' }
  ];

  // Disponibilidade
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

  // Auth prestador
  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') { setIsAdmin(true); setView('prestador'); }
    else { alert('Senha incorreta!'); }
  };

  // Cadastro cliente
  const handleRegister = () => {
    if (!registerForm.name || !registerForm.phone || !registerForm.password) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }
    const exists = clients.find(c => c.phone === registerForm.phone);
    if (exists) { alert('WhatsApp já cadastrado!'); return; }
    const newClient = { ...registerForm };
    setClients([...clients, newClient]);
    alert('Cadastro realizado com sucesso! Volte ao login para entrar.');
    setRegisterForm({ name: '', phone: '', password: '', email: '' });
    setAuthView('login');
  };

  // Login cliente
  const handleClientLogin = () => {
    const found = clients.find(c => c.phone === clientLogin.phone && c.password === clientLogin.password);
    if (found) {
      setIsClientLogged(true);
      setClientForm(prev => ({ ...prev, ...found }));
    } else {
      alert('WhatsApp ou senha inválidos');
    }
  };

  // Enviar agendamento
  const handleClientSubmit = () => {
    if (!clientForm.name || !clientForm.phone || !clientForm.address || !clientForm.date) {
      alert('Preencha os campos obrigatórios!');
      return;
    }
    const newBooking = {
      id: Date.now(),
      ...clientForm,
      professionalName: professionals[clientForm.professionalId].name,
      status: 'pendente',
      rating: null,
      feedback: ''
    };
    setBookings([...bookings, newBooking]);
    alert('Solicitação enviada com sucesso!');
    setClientForm({
      ...clientForm,
      address: '',
      date: '',
      housePreparation: '',
      observations: ''
    });
  };

  // Avaliações do profissional
  const getProfessionalReviews = (id) => {
    const reviews = bookings.filter(b => b.professionalId === id && b.status === 'concluido' && b.rating);
    const avg = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null;
    return { avg, reviews };
  };

  const selectedProfessional = professionals[currentProfessional];
  const { avg, reviews } = getProfessionalReviews(selectedProfessional.id);

  // Componente da aba Perfil
  const Perfil = () => (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-lg font-bold mb-4">Meu Perfil</h2>
      <div className="space-y-3">
        <input
          type="text"
          value={clientForm.name}
          onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
          className="w-full p-3 border rounded"
          placeholder="Nome"
        />
        <input
          type="text"
          value={clientForm.phone}
          onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
          className="w-full p-3 border rounded"
          placeholder="WhatsApp"
        />
        <input
          type="email"
          value={clientForm.email || ''}
          onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
          className="w-full p-3 border rounded"
          placeholder="E-mail"
        />
        <input
          type="password"
          value={clientForm.password || ''}
          onChange={e => setClientForm({ ...clientForm, password: e.target.value })}
          className="w-full p-3 border rounded"
          placeholder="Senha"
        />
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => {
            // Atualiza cliente no localStorage (chave: phone do login atual)
            setClients(clients.map(c => c.phone === clientLogin.phone ? {
              name: clientForm.name,
              phone: clientForm.phone,
              email: clientForm.email,
              password: clientForm.password
            } : c));
            // Atualiza referência de login se o phone mudou
            setClientLogin(prev => ({ ...prev, phone: clientForm.phone }));
            alert('Perfil atualizado com sucesso!');
          }}
          className="flex-1 bg-indigo-600 text-white py-3 rounded font-bold"
        >
          Salvar Alterações
        </button>

        <button
          onClick={() => {
            // Remove cliente e encerra sessão
            setClients(clients.filter(c => c.phone !== clientForm.phone));
            setIsClientLogged(false);
            setAuthView('login');
            setClientLogin({ phone: '', password: '', email: '' });
            setClientForm({
              name: '',
              phone: '',
              email: '',
              password: '',
              address: '',
              professionalId: 0,
              cleaningType: 'basica',
              date: '',
              provideMeal: 'nenhum',
              housePreparation: '',
              observations: ''
            });
            alert('Cadastro apagado. Faça novo cadastro para incluir e-mail.');
          }}
          className="flex-1 bg-red-600 text-white py-3 rounded font-bold"
        >
          Apagar Cadastro
        </button>
      </div>
    </div>
  );

  // ÁREA DO CLIENTE (logado)
  if (isClientLogged && view === 'cliente') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 font-sans text-base">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header com tabs */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-indigo-600 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Área do Cliente</h1>
              <p className="text-gray-500">Bem-vindo, {clientForm.name || '—'}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setClientTab('agendamento')}
                className={`px-3 py-2 rounded ${clientTab === 'agendamento' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}
              >
                Agendamento
              </button>
              <button
                onClick={() => setClientTab('perfil')}
                className={`px-3 py-2 rounded ${clientTab === 'perfil' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}
              >
                Perfil
              </button>
            </div>
          </div>

          {clientTab === 'perfil' ? (
            <Perfil />
          ) : (
            <>
              {/* 1. Profissional */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><User /> 1. Escolha o Profissional</h2>
                <div className="flex items-center gap-4 border-2 border-gray-100 p-6 rounded-2xl bg-gray-50">
                  <button
                    onClick={() => setCurrentProfessional((currentProfessional - 1 + professionals.length) % professionals.length)}
                    className="p-2 hover:bg-white rounded-full shadow-sm bg-white"
                  >
                    <ChevronLeft />
                  </button>

                  <div className="flex-1 text-center">
                    <div className="w-20 h-20 mx-auto rounded-full mb-3 bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {selectedProfessional.name[0]}
                    </div>
                    <h3 className="font-bold text-lg">{selectedProfessional.name}</h3>
                    <p className="text-indigo-600 font-bold">{selectedProfessional.specialty}</p>
                    <p className="text-gray-500 mt-1">{selectedProfessional.experience}</p>

                    {avg && <p className="text-yellow-600 font-bold mt-2">⭐ {avg} / 5</p>}
                    {reviews.slice(0, 2).map((r, i) => (
                      <p key={i} className="text-gray-600 italic text-sm">"{r.feedback}"</p>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentProfessional((currentProfessional + 1) % professionals.length)}
                    className="p-2 hover:bg-white rounded-full shadow-sm bg-white"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>

              {/* 2. Tipo de Limpeza */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Sparkles /> 2. Tipo de Limpeza</h2>
                <div className="grid gap-4">
                  {Object.entries(cleaningTypes).map(([key, type]) => (
                    <label
                      key={key}
                      className={`border-2 p-5 rounded-2xl cursor-pointer transition-all ${
                        clientForm.cleaningType === key ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        className="hidden"
                        name="cleaning"
                        value={key}
                        checked={clientForm.cleaningType === key}
                        onChange={() => setClientForm({ ...clientForm, cleaningType: key, professionalId: currentProfessional })}
                      />
                      <div className="flex justify-between font-bold text-gray-800 text-lg">
                        <span>{type.name}</span>
                        <span>{type.price}</span>
                      </div>
                      <p className="text-gray-500 mb-3">{type.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {type.surfaces.map((s, i) => (
                          <span
                            key={i}
                            className="bg-white border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-600 flex items-center gap-1"
                          >
                            <CheckCircle size={14} /> {s}
                          </span>
                        ))}
                      </div>
                    </label>
                  ))}
                </div>

                {clientForm.cleaningType && (
                  <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
                    <strong>{cleaningTypes[clientForm.cleaningType].name}</strong><br />
                    {cleaningTypes[clientForm.cleaningType].description}
                    <ul className="list-disc list-inside mt-2">
                      {cleaningTypes[clientForm.cleaningType].surfaces.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-sm">
                      ⚠️ O contratante deve deixar o espaço desobstruído para facilitar o trabalho do profissional.
                    </p>
                  </div>
                )}
              </div>

              {/* 3. Dados do Agendamento */}
              <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                <h2 className="text-lg font-bold flex items-center gap-2"><FileText /> 3. Dados do Agendamento</h2>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Seu Nome Completo"
                    value={clientForm.name}
                    onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Seu WhatsApp (DDD)"
                    value={clientForm.phone}
                    onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Seu e-mail (opcional)"
                    value={clientForm.email}
                    onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Endereço de Atendimento (Rua, Número, Bairro)"
                    value={clientForm.address}
                    onChange={e => setClientForm({ ...clientForm, address: e.target.value })}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-2">Data do Serviço (Segunda a Sexta)</label>
                  <input
                    type="date"
                    value={clientForm.date}
                    onChange={e => setClientForm({ ...clientForm, date: e.target.value })}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <div className={`mt-3 p-4 rounded-xl font-bold ${availability.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {availability.message}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-2">Refeição do Prestador</label>
                  <div className="flex flex-wrap gap-3">
                    {mealOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setClientForm({ ...clientForm, provideMeal: opt.value })}
                        className={`px-5 py-2 rounded-full border-2 transition ${
                          clientForm.provideMeal === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-2">Preparação da Casa *</label>
                  <textarea
                    placeholder="Ex: Deixarei os produtos no tanque, a chave está na portaria, tenho um pet no quintal..."
                    value={clientForm.housePreparation}
                    onChange={e => setClientForm({ ...clientForm, housePreparation: e.target.value })}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    rows="3"
                  />
                </div>

                <button
                  onClick={handleClientSubmit}
                  disabled={!availability.available}
                  className={`w-full py-5 rounded-2xl text-white font-bold text-xl shadow-xl transition-all ${
                    availability.available ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {clientForm.cleaningType === 'orcamento' ? 'Solicitar Orçamento' : 'Confirmar Agendamento'}
                </button>
              </div>

              {/* Avaliação dos serviços concluídos (cliente) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm mt-6">
                <h2 className="text-lg font-bold mb-4">Avaliar Serviços Concluídos</h2>
                {bookings.filter(b => b.status === 'concluido' && b.phone === clientForm.phone).length === 0 && (
                  <p className="text-gray-500">Nenhum serviço concluído para avaliar ainda.</p>
                )}
                {bookings
                  .filter(b => b.status === 'concluido' && b.phone === clientForm.phone)
                  .map(b => (
                    <div key={b.id} className="p-4 border rounded-xl mb-4 bg-gray-50">
                      <p className="font-bold">{b.professionalName} — {cleaningTypes[b.cleaningType].name}</p>
                      <p className="text-gray-500 text-sm mb-2">Data: {b.date}</p>
                      <div className="flex gap-2 my-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setBookings(bookings.map(x => x.id === b.id ? { ...x, rating: star } : x))}
                            className={`px-3 py-1 rounded-full border ${b.rating === star ? 'bg-yellow-400 text-white border-yellow-400' : 'bg-white text-gray-600 border-gray-200'}`}
                          >
                            {star} ★
                          </button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Deixe seu comentário sobre o serviço..."
                        value={b.feedback || ''}
                        onChange={e => setBookings(bookings.map(x => x.id === b.id ? { ...x, feedback: e.target.value } : x))}
                        className="w-full p-3 border border-gray-200 rounded-xl"
                        rows="3"
                      />
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // LOGIN DO CLIENTE
  if (!isClientLogged && view === 'cliente' && authView === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-xl font-bold mb-4 text-center">Login do Cliente</h1>
          <input
            type="text"
            placeholder="WhatsApp"
            value={clientLogin.phone}
            onChange={e => setClientLogin({ ...clientLogin, phone: e.target.value })}
            className="w-full p-2 border rounded mb-4"
          />
          <input
            type="password"
            placeholder="Senha"
            value={clientLogin.password}
            onChange={e => setClientLogin({ ...clientLogin, password: e.target.value })}
            className="w-full p-2 border rounded mb-4"
          />
          <button
            onClick={handleClientLogin}
            className="w-full bg-indigo-600 text-white py-2 rounded font-bold"
          >
            Entrar
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            Novo por aqui?{' '}
            <button onClick={() => setAuthView('register')} className="text-indigo-600 underline">
              Cadastre-se
            </button>
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            Esqueceu a senha?{' '}
            <button onClick={() => setAuthView('forgot')} className="text-indigo-600 underline">
              Recuperar
            </button>
          </p>

          <div className="mt-6 border-t pt-4 text-center">
            <p className="text-sm text-gray-500 mb-2">Acesso do Prestador</p>
            <button onClick={() => setView('prestador')} className="text-indigo-600 underline text-sm">
              Entrar como Prestador
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CADASTRO DO CLIENTE
  if (!isClientLogged && view === 'cliente' && authView === 'register') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-xl font-bold mb-4 text-center">Cadastro de Cliente</h1>
          <input
            type="text"
            placeholder="Nome"
            value={registerForm.name}
            onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            placeholder="WhatsApp"
            value={registerForm.phone}
            onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="email"
            placeholder="E-mail (opcional)"
            value={registerForm.email}
            onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="password"
            placeholder="Senha"
            value={registerForm.password}
            onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
            className="w-full p-2 border rounded mb-4"
          />
          <button
            onClick={handleRegister}
            className="w-full bg-green-600 text-white py-2 rounded font-bold"
          >
            Cadastrar
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            Já tem conta?{' '}
            <button onClick={() => setAuthView('login')} className="text-indigo-600 underline">
              Voltar ao Login
            </button>
          </p>
        </div>
      </div>
    );
  }

  // RECUPERAÇÃO DE SENHA VIA E-MAIL (placeholder de envio)
  if (!isClientLogged && view === 'cliente' && authView === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-xl font-bold mb-4 text-center">Recuperar Senha</h1>
          <input
            type="email"
            placeholder="Digite seu e-mail cadastrado"
            value={clientLogin.email}
            onChange={e => setClientLogin({ ...clientLogin, email: e.target.value })}
            className="w-full p-2 border rounded mb-4"
          />
          <button
            onClick={() => {
              const found = clients.find(c => c.email && c.email.toLowerCase() === clientLogin.email.toLowerCase());
              if (found) {
                // Aqui você integraria com o back-end para enviar o e-mail com link/código
                alert('Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.');
                setAuthView('login');
                setClientLogin({ ...clientLogin, email: '' });
              } else {
                alert('E-mail não encontrado. Tente outro e-mail ou entre em contato com o suporte.');
              }
            }}
            className="w-full bg-indigo-600 text-white py-2 rounded font-bold"
          >
            Enviar instruções por e-mail
          </button>
          <p className="mt-4 text-center text-sm text-gray-500">
            <button onClick={() => setAuthView('login')} className="text-indigo-600 underline">
              Voltar ao Login
            </button>
          </p>
        </div>
      </div>
    );
  }

  // LOGIN DO PRESTADOR
  if (!isAdmin && view === 'prestador') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-xl font-bold mb-4 text-center">Acesso do Prestador</h1>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="Senha"
          />
          <button onClick={handleAdminLogin} className="w-full bg-indigo-600 text-white py-2 rounded mb-2 font-bold">
            Entrar
          </button>
          <button onClick={() => setView('cliente')} className="w-full text-gray-500 text-sm">
            Voltar ao Agendamento
          </button>
        </div>
      </div>
    );
  }

  // PAINEL DO PRESTADOR
  if (isAdmin && view === 'prestador') {
    return (
      <div className="min-h-screen bg-blue-50 p-4 font-sans text-base">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">Painel de Gestão</h1>
            <button onClick={() => { setIsAdmin(false); setView('cliente'); }} className="bg-red-500 text-white px-4 py-2 rounded-lg">
              Sair
            </button>
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
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      b.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                      b.status === 'confirmado' ? 'bg-blue-100 text-blue-700' :
                      b.status === 'concluido' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}
                  >
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
                  <strong>Preparação:</strong> {b.housePreparation || 'Nenhuma observação'}
                </div>

                {b.status === 'pendente' && (
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setBookings(bookings.map(x => x.id === b.id ? { ...x, status: 'confirmado' } : x))}
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setBookings(bookings.map(x => x.id === b.id ? { ...x, status: 'recusado' } : x))}
                      className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold"
                    >
                      Recusar
                    </button>
                  </div>
                )}

                {b.status === 'confirmado' && (
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setBookings(bookings.map(x => x.id === b.id ? { ...x, status: 'concluido' } : x))}
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold"
                    >
                      Marcar como Concluído
                    </button>
                    <button
                      onClick={() => setBookings(bookings.map(x => x.id === b.id ? { ...x, status: 'recusado' } : x))}
                      className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-bold mb-4">Agendamentos Realizados</h2>
            {bookings.filter(b => b.status === 'concluido').map(b => (
              <div key={b.id} className="bg-white p-4 rounded-xl shadow-sm mb-2">
                <p><strong>Cliente:</strong> {b.name}</p>
                <p><strong>Serviço:</strong> {cleaningTypes[b.cleaningType].name}</p>
                <p><strong>Data:</strong> {b.date}</p>
                {b.rating && <p><strong>Avaliação:</strong> {b.rating} ★</p>}
                {b.feedback && <p><strong>Feedback:</strong> {b.feedback}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT: se não estiver logado e não for prestador, mostra login do cliente
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">Login do Cliente</h1>
        <input
          type="text"
          placeholder="WhatsApp"
          value={clientLogin.phone}
          onChange={e => setClientLogin({ ...clientLogin, phone: e.target.value })}
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="password"
          placeholder="Senha"
          value={clientLogin.password}
          onChange={e => setClientLogin({ ...clientLogin, password: e.target.value })}
          className="w-full p-2 border rounded mb-4"
        />
        <button
          onClick={handleClientLogin}
          className="w-full bg-indigo-600 text-white py-2 rounded font-bold"
        >
          Entrar
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          Novo por aqui?{' '}
          <button onClick={() => setAuthView('register')} className="text-indigo-600 underline">
            Cadastre-se
          </button>
        </p>
        <p className="mt-2 text-center text-sm text-gray-500">
          Esqueceu a senha?{' '}
          <button onClick={() => setAuthView('forgot')} className="text-indigo-600 underline">
            Recuperar
          </button>
        </p>

        <div className="mt-6 border-t pt-4 text-center">
          <p className="text-sm text-gray-500 mb-2">Acesso do Prestador</p>
          <button onClick={() => setView('prestador')} className="text-indigo-600 underline text-sm">
            Entrar como Prestador
          </button>
        </div>

        {/* Rotas simples de auth embutidas */}
        {authView === 'register' && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-3 text-center">Cadastro</h2>
            <input
              type="text"
              placeholder="Nome"
              value={registerForm.name}
              onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="WhatsApp"
              value={registerForm.phone}
              onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="email"
              placeholder="E-mail (opcional)"
              value={registerForm.email}
              onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="password"
              placeholder="Senha"
              value={registerForm.password}
              onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            />
            <button
              onClick={handleRegister}
              className="w-full bg-green-600 text-white py-2 rounded font-bold"
            >
              Cadastrar
            </button>
            <p className="mt-3 text-center text-sm">
              <button onClick={() => setAuthView('login')} className="text-indigo-600 underline">
                Voltar ao Login
              </button>
            </p>
          </div>
        )}

        {authView === 'forgot' && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-3 text-center">Recuperar Senha</h2>
            <input
              type="email"
              placeholder="Digite seu e-mail cadastrado"
              value={clientLogin.email}
              onChange={e => setClientLogin({ ...clientLogin, email: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            />
            <button
              onClick={() => {
                const found = clients.find(c => c.email && c.email.toLowerCase() === clientLogin.email.toLowerCase());
                if (found) {
                  // Integração real deve enviar e-mail com token/link
                  alert('Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.');
                  setAuthView('login');
                  setClientLogin({ ...clientLogin, email: '' });
                } else {
                  alert('E-mail não encontrado. Tente outro e-mail ou entre em contato com o suporte.');
                }
              }}
              className="w-full bg-indigo-600 text-white py-2 rounded font-bold"
            >
              Enviar instruções por e-mail
            </button>
            <p className="mt-3 text-center text-sm">
              <button onClick={() => setAuthView('login')} className="text-indigo-600 underline">
                Voltar ao Login
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
