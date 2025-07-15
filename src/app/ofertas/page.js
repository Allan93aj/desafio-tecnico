"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import styles from './ofertas.module.css';

// Hook para detectar se é mobile
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth <= 768);
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
}

export default function Ofertas(){
   
    const [produtos, setProdutos] = useState([]); // Lista completa de produtos vindos da API
    const [produtosFiltrados, setProdutosFiltrados] = useState([]);// Lista de produtos após aplicação dos filtros
    const [produtosVisiveis, setProdutosVisiveis] = useState([]);// Lista de produtos atualmente visíveis na tela (para lazy loading)
    const [loading, setLoading] = useState(true); // Indica se está carregando os dados iniciais
    const [carregandoMais, setCarregandoMais] = useState(false);// Indica se está carregando mais produtos (lazy loading)
    const [temMais, setTemMais] = useState(true);// Indica se ainda há mais produtos para carregar
    const [categorias, setCategorias] = useState([]);// Lista de categorias disponíveis para filtro
    const [categoriaSelecionada, setCategoriaSelecionada] = useState('');// Categoria selecionada no filtro
    const [precoMin, setPrecoMin] = useState('');// Valor mínimo do filtro de preço
    const [precoMax, setPrecoMax] = useState('');// Valor máximo do filtro de preço
    const itensPorPagina = 8;
    const pagina = useRef(1);
    const isMobile = useIsMobile();

    // Busca todos os produtos e categorias da API ao montar o componente
    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch('https://fakestoreapi.com/products').then(res => res.json()),
            fetch('https://fakestoreapi.com/products/categories').then(res => res.json())
        ]).then(([produtosData, categoriasData]) => {
            setProdutos(produtosData);
            setCategorias(categoriasData);
            setLoading(false);
        });
    }, []);

    // Aplica filtros de categoria e preço
    useEffect(() => {
        let filtrados = produtos;
        if (categoriaSelecionada) {
            filtrados = filtrados.filter(p => p.category === categoriaSelecionada);
        }
        if (precoMin !== '') {
            filtrados = filtrados.filter(p => p.price * 5.2 >= Number(precoMin));
        }
        if (precoMax !== '') {
            filtrados = filtrados.filter(p => p.price * 5.2 <= Number(precoMax));
        }
        setProdutosFiltrados(filtrados);
        setProdutosVisiveis(filtrados.slice(0, itensPorPagina));
        pagina.current = 1;
        setTemMais(filtrados.length > itensPorPagina);
    }, [produtos, categoriaSelecionada, precoMin, precoMax]);

    // Função para carregar mais produtos filtrados
    const carregarMais = useCallback(() => {
        if (carregandoMais || !temMais) return;
        setCarregandoMais(true);
        setTimeout(() => {
            const proximaPagina = pagina.current + 1;
            const novoLimite = proximaPagina * itensPorPagina;
            setProdutosVisiveis(produtosFiltrados.slice(0, novoLimite));
            pagina.current = proximaPagina;
            setTemMais(produtosFiltrados.length > novoLimite);
            setCarregandoMais(false);
        }, 600); // Simula carregamento
    }, [carregandoMais, temMais, produtosFiltrados]);

    // Observa o scroll para disparar o carregamento infinito
    useEffect(() => {
        function onScroll() {
            if (!temMais || carregandoMais) return;
            const scrollY = window.scrollY;
            const innerHeight = window.innerHeight;
            const offsetHeight = document.body.offsetHeight;
            if (scrollY + innerHeight >= offsetHeight - 200) {
                carregarMais();
            }
        }
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [carregarMais, temMais, carregandoMais]);

    // Handlers dos filtros
    function handleCategoria(e) {
        setCategoriaSelecionada(e.target.value);
    }
    function handlePrecoMin(e) {
        setPrecoMin(e.target.value);
    }
    function handlePrecoMax(e) {
        setPrecoMax(e.target.value);
    }
    function limparFiltros() {
        setCategoriaSelecionada('');
        setPrecoMin('');
        setPrecoMax('');
    }

    return(
        <>
            {/* Banner no topo da página (full width) */}
            <img src={isMobile ? "/img/banner-mobile.png" : "/img/banner-desk.png"} alt="Banner Ofertas" className={styles['banner-ofertas']} />
            {/* Container centralizado para o conteúdo da página de ofertas */}
            <div className={styles['ofertas-container']}>
                {/* Título da seção */}
                <h2 className={styles['titulo-ofertas']}>Ofertas da Semana</h2>
                {/* Filtros por categoria e faixa de preço */}
                <div className={styles['filtros-container']}>
                    {/* Filtros agrupados em linha */}
                    <div className={styles['filtros-row']}>
                        <select value={categoriaSelecionada} onChange={handleCategoria} className={styles['filtro-select']}>
                            <option value="">Categorias</option>
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                            ))}
                        </select>
                        <input type="number" placeholder="Preço mínimo" value={precoMin} onChange={handlePrecoMin} className={styles['filtro-input']} min={0} />
                        <input type="number" placeholder="Preço máximo" value={precoMax} onChange={handlePrecoMax} className={styles['filtro-input']} min={0} />
                    </div>
                    {/* Botão para limpar filtros */}
                    <button onClick={limparFiltros} className={styles['filtro-btn']}>Limpar filtros</button>
                </div>
                {/* Grid de produtos com lazy loading */}
                <div className={styles['produtos-grid']}>
                    {loading ? (
                        <p>Carregando produtos...</p>
                    ) : (
                        produtosVisiveis.map((produto) => (
                            // Card de produto
                            <div key={produto.id} className={styles['produto-card']}>
                                {/* Imagem do produto */}
                                <div className={styles['produto-img-wrapper']}>
                                    <img src={produto.image} alt={produto.title} className={styles['produto-img']} />
                                </div>
                                {/* Informações do produto */}
                                <div className={styles['produto-info-wrapper']}>
                                    <h3 className={styles['produto-nome']}>{produto.title}</h3>
                                    <p className={styles['produto-preco']}>
                                        {(produto.price * 5.2).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                    <button className={styles['produto-btn']}>Comprar</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>                
            </div>
        </>
    )
}