import Knex from 'knex'

export async function seed(knex : Knex){

   await  knex('items').insert([
        {title: 'Lampadas' , image: 'lampadas.svg'},
        {title: 'Pilhas e Baterias' , image: 'baterias.svg'},
        {title: 'Papéis e Papelao' , image: 'papeis-papelao.svg'},
        {title: 'Resíduos Eletrônicos' , image: 'eletronicos.svg'},
        {title: 'Resíduos Orgânicos' , image: 'organicos.svg'},
        {title: 'Óleo de Cozinha' , image: 'oleo.svg'},
    ]);
}