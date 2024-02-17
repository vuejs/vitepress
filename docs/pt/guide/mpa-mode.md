# Modo MPA <Badge type="warning" text="experimental" /> {#mpa-mode}

O modo MPA (Aplicação Multipáginas) pode ser habilitado pela linha de comando com `vitepress build --mpa`, ou através da configuração pela opção `mpa: true`.

No modo MPA, todas as páginas são apresentadas por padrão sem qualquer JavaScript incluído. Como resultado, o site em produção provavelmente terá uma nota de desempenho de visita inicial superior com ferramentas de auditoria.

Entretanto, devido a ausência de navegação SPA, links entre páginas acarretarão em recarregamentos de página completos. Navegações pós-carregamento no modo MPA não parecerão tão instantâneas quanto no modo SPA.

Também note que não ter JavaScript por padrão significa que você está essencialmente utilizando Vue como modelo de linguagem no lado do servidor. Nenhum manipulador de evento será embutido no navegador, então não haverá interatividade. Para carregar JavaScript no lado do cliente, você precisará usar a tag especial `<script client>`:

```html
<script client>
document.querySelector('h1').addEventListener('click', () => {
  console.log('JavaScript no lado do cliente!')
})
</script>

# Olá
```

`<script client>` é uma funcionalidade exclusiva VitePress, não uma funcionalidade Vue. Funciona tanto em arquivos `.md` quanto em arquivos `.vue`, mas apenas no modo MPA. Scripts de cliente em todos os componentes do tema serão empacotados juntos, enquanto o script do cliente para uma página específica será dividido apenas para aquela página.

Note que `<script client>` **não é avaliado como código de componente Vue**: é processado como um simples módulo JavaScript. Por esta razão, o modo MPA deve ser usado apenas se seu site exige o mínimo absoluto de interatividade no lado do cliente.
