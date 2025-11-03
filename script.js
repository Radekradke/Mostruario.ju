/* ========== CONFIGURAÇÕES ========== */
const WHATSAPP_NUMBER = "5521992344201"; // Número da loja
const COMPANY_NAME = "Ju-Acessorios";

const ITEMS_PER_PAGE = 12;
let currentPage = 1;

const grid = document.getElementById('grid');
const modalBack = document.getElementById('modalBack');
const modalTitle = document.getElementById('modalTitle');
const modalImg = document.getElementById('modalImg');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
const modalWpp = document.getElementById('modalWpp');
const closeBtn = document.getElementById('closeBtn');

/* Helper: tenta carregar products.json do servidor (se houver).
   Se não existir, cai para o array gerado automaticamente.
*/
async function loadProducts() {
  try {
    const resp = await fetch('./products.json', {cache: "no-store"});
    if (!resp.ok) throw new Error('no products.json');
    const json = await resp.json();
    if (!Array.isArray(json)) throw new Error('products.json inválido');
    return json;
  } catch (e) {
    // fallback: gerar 60 produtos
    const fallback = [];
    for (let i = 1; i <= 60; i++) {
      fallback.push({
        id: `p${i}`,
        title: `Produto ${i}`,
        subtitle: "Acessório Exclusivo",
        price: "—",
        img: `images/produto${i}.jpeg`,
        desc: `Descrição do Produto ${i}.`,
        badge: i <= 6 ? "Novo" : "Coleção",
        sold: false
      });
    }
    return fallback;
  }
}

function waLink(phone, text) {
  const t = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${t}`;
}

// render da grade com paginação e suporte a sold:true
function renderGrid(PRODUCTS) {
  grid.innerHTML = '';
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const visible = PRODUCTS.slice(start, end);

  visible.forEach((p, index) => {
    const c = document.createElement('article');
    c.className = 'card';
    c.style.animationDelay = `${0.05 * index}s`;

    // se estiver esgotado, mostra badge Esgotado e desativa botão
    const soldBadge = p.sold ? `<div class="badge badge-sold">Esgotado</div>` : `<div class="badge">${p.badge || ''}</div>`;
    const priceText = p.price && p.price !== "—" ? p.price : "—";

    c.innerHTML = `
      <div class="thumb-container">
        <img class="thumb" src="${p.img}" alt="${p.title}">
        ${soldBadge}
      </div>
      <div class="card-content">
        <div class="card-header">
          <div class="title">${p.title}</div>
          <div class="subtitle">${p.subtitle || ''}</div>
        </div>
        <div class="price">${priceText}<small>/unidade</small></div>
        <div class="actions">
          <button class="btn details" data-id="${p.id}">Ver Detalhes</button>
          <button class="btn wpp" data-id="${p.id}" ${p.sold ? 'disabled aria-disabled="true"' : ''}>💎 Pedir</button>
        </div>
      </div>
    `;
    // se esgotado, estilizamos um pouco diferente no card para visual
    if (p.sold) c.style.opacity = '0.7';

    grid.appendChild(c);
  });

  renderPagination(PRODUCTS);
}

// cria os botões de paginação
function renderPagination(PRODUCTS) {
  const totalPages = Math.ceil(PRODUCTS.length / ITEMS_PER_PAGE);
  // remove área de paginação antiga, se houver
  const old = document.querySelector('.pagination');
  if (old) old.remove();

  const container = document.createElement('div');
  container.className = 'pagination';
  container.style.textAlign = 'center';
  container.style.marginTop = '40px';

  const prev = document.createElement('button');
  prev.textContent = '← Anterior';
  prev.className = 'btn details';
  prev.disabled = currentPage === 1;
  prev.onclick = () => {
    currentPage--;
    renderGrid(PRODUCTS);
    window.scrollTo(0, 0);
  };

  const next = document.createElement('button');
  next.textContent = 'Próxima →';
  next.className = 'btn details';
  next.disabled = currentPage === totalPages;
  next.onclick = () => {
    currentPage++;
    renderGrid(PRODUCTS);
    window.scrollTo(0, 0);
  };

  const info = document.createElement('span');
  info.style.color = '#fff';
  info.style.margin = '0 20px';
  info.textContent = `Página ${currentPage} de ${totalPages}`;

  container.appendChild(prev);
  container.appendChild(info);
  container.appendChild(next);

  // adiciona depois do grid
  grid.appendChild(container);
}

// evento de clique para abrir modal ou enviar WhatsApp
function attachGridEvents(PRODUCTS) {
  grid.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const product = PRODUCTS.find(x => x.id === id);
    if (!product) return;

    if (btn.classList.contains('wpp')) {
      const pageUrl = location.href.split('#')[0];
      const msg = `Olá *${COMPANY_NAME}*! 💎\n\nTenho interesse em:\n\n✦ *${product.title}*\n💰 ${product.price}\n\n🔗 Mostruário: ${pageUrl}`;
      window.open(waLink(WHATSAPP_NUMBER, msg), '_blank');
    } else {
      modalTitle.textContent = product.title;
      modalImg.src = product.img;
      modalImg.alt = product.title;
      modalDesc.textContent = product.desc;
      modalPrice.textContent = product.price;
      modalBack.style.display = "flex";

      // configurar botão do modal (respeita sold)
      modalWpp.disabled = !!product.sold;
      modalWpp.onclick = () => {
        const pageUrl = location.href.split('#')[0];
        const msg = `Olá *${COMPANY_NAME}*! 💎\n\nGostaria de saber mais sobre:\n\n✦ *${product.title}*\n${product.subtitle}\n💰 ${product.price}\n\n📋 ${product.desc}\n\n🔗 Link: ${pageUrl}`;
        window.open(waLink(WHATSAPP_NUMBER, msg), '_blank');
      };
    }
  });

  // fechar modal
  closeBtn.addEventListener('click', () => modalBack.style.display = 'none');
  modalBack.addEventListener('click', (e) => { if (e.target === modalBack) modalBack.style.display = 'none'; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modalBack.style.display = 'none'; });
}

// inicializa: carrega produtos e renderiza
(async function init() {
  const PRODUCTS = await loadProducts();
  renderGrid(PRODUCTS);
  attachGridEvents(PRODUCTS);
})();
