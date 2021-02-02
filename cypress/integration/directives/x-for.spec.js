import { beVisible, haveLength, haveText, notBeVisible, test } from '../../utils'

test('renders loops with x-for',
    `
        <div x-data="{ items: ['foo'] }">
            <button x-on:click="items = ['foo', 'bar']">click me</button>

            <template x-for="item in items">
                <span x-text="item"></span>
            </template>
        </div>
    `,
    get => {
        get('span:nth-of-type(1)').should(haveText('foo'))
        get('span:nth-of-type(2)').should(notBeVisible())
        get('button').click()
        get('span:nth-of-type(1)').should(haveText('foo'))
        get('span:nth-of-type(2)').should(haveText('bar'))
    }
)

test('removes all elements when array is empty and previously had one item',
    `
        <div x-data="{ items: ['foo'] }">
            <button x-on:click="items = []">click me</button>

            <template x-for="item in items">
                <span x-text="item"></span>
            </template>
        </div>
    `,
    get => {
        get('span').should(beVisible())
        get('button').click()
        get('span').should(notBeVisible())
    }
)

test('removes all elements when array is empty and previously had multiple items',
    `
        <div x-data="{ items: ['foo', 'bar', 'world'] }">
            <button x-on:click="items = []">click me</button>

            <template x-for="item in items">
                <span x-text="item"></span>
            </template>
        </div>
    `,
    get => {
        get('span:nth-of-type(1)').should(beVisible())
        get('span:nth-of-type(2)').should(beVisible())
        get('span:nth-of-type(3)').should(beVisible())
        get('button').click()
        get('span:nth-of-type(1)').should(notBeVisible())
        get('span:nth-of-type(2)').should(notBeVisible())
        get('span:nth-of-type(3)').should(notBeVisible())
    }
)

test('elements inside of loop are reactive',
    `
        <div x-data="{ items: ['first'], foo: 'bar' }">
            <button x-on:click="foo = 'baz'">click me</button>

            <template x-for="item in items">
                <span>
                    <h1 x-text="item"></h1>
                    <h2 x-text="foo"></h2>
                </span>
            </template>
        </div>
    `,
    get => {
        get('span').should(beVisible())
        get('h1').should(haveText('first'))
        get('h2').should(haveText('bar'))
        get('button').click()
        get('span').should(beVisible())
        get('h1').should(haveText('first'))
        get('h2').should(haveText('baz'))
    }
)

test('components inside of loop are reactive',
    `
        <div x-data="{ items: ['first'] }">
            <template x-for="item in items">
                <div x-data="{foo: 'bar'}" class="child">
                    <span x-text="foo"></span>
                    <button x-on:click="foo = 'bob'">click me</button>
                </div>
            </template>
        </div>
    `,
    get => {
        get('span').should(haveText('bar'))
        get('button').click()
        get('span').should(haveText('bob'))
    }
)

test('components inside a plain element of loop are reactive',
    `
        <div x-data="{ items: ['first'] }">
            <template x-for="item in items">
                <ul>
                    <div x-data="{foo: 'bar'}" class="child">
                        <span x-text="foo"></span>
                        <button x-on:click="foo = 'bob'">click me</button>
                    </div>
                </ul>
            </template>
        </div>
    `,
    get => {
        get('span').should(haveText('bar'))
        get('button').click()
        get('span').should(haveText('bob'))
    }
)

// @flaky
test('adding key attribute moves dom nodes properly',
    `
        <div x-data="{ items: ['foo', 'bar'] }">
            <button x-on:click="items = ['bar', 'foo', 'baz']" id="reorder">click me</button>
            <button x-on:click="$el.parentElement.querySelectorAll('span').forEach((el, index) => el.og_loop_index = index)" id="assign">click me</button>

            <template x-for="item in items" :key="item">
                <span x-text="item"></span>
            </template>
        </div>
    `,
    get => {
        let haveOgIndex = index => el => expect(el[0].og_loop_index).to.equal(index)

        get('#assign').click()
        get('span:nth-of-type(1)').should(haveOgIndex(0))
        get('span:nth-of-type(2)').should(haveOgIndex(1))
        get('#reorder').click()
        get('span:nth-of-type(1)').should(haveOgIndex(1))
        get('span:nth-of-type(2)').should(haveOgIndex(0))
        get('span:nth-of-type(3)').should(haveOgIndex(undefined))
    }
)

test('can key by index',
    `
        <div x-data="{ items: ['foo', 'bar'] }">
            <button x-on:click="items = ['bar', 'foo', 'baz']" id="reorder">click me</button>
            <button x-on:click="$el.parentElement.querySelectorAll('span').forEach((el, index) => el.og_loop_index = index)" id="assign">click me</button>

            <template x-for="(item, index) in items" :key="index">
                <span x-text="item"></span>
            </template>
        </div>
    `,
    get => {
        let haveOgIndex = index => el => expect(el[0].og_loop_index).to.equal(index)

        get('#assign').click()
        get('span:nth-of-type(1)').should(haveOgIndex(0))
        get('span:nth-of-type(2)').should(haveOgIndex(1))
        get('#reorder').click()
        get('span:nth-of-type(1)').should(haveOgIndex(0))
        get('span:nth-of-type(2)').should(haveOgIndex(1))
        get('span:nth-of-type(3)').should(haveOgIndex(undefined))
    }
)

test('can use index inside of loop',
    `
        <div x-data="{ items: ['foo'] }">
            <template x-for="(item, index) in items">
                <div>
                    <h1 x-text="items.indexOf(item)"></h1>
                    <h2 x-text="index"></h2>
                </div>
            </template>
        </div>
    `,
    get => {
        get('h1').should(haveText(0))
        get('h2').should(haveText(0))
    }
)

test('can use third iterator param (collection) inside of loop',
    `
        <div x-data="{ items: ['foo'] }">
            <template x-for="(item, index, things) in items">
                <div>
                    <h1 x-text="items"></h1>
                    <h2 x-text="things"></h2>
                </div>
            </template>
        </div>
    `,
    get => {
        get('h1').should(haveText('foo'))
        get('h2').should(haveText('foo'))
    }
)

test('listeners in loop get fresh iteration data even though they are only registered initially',
    `
        <div x-data="{ items: ['foo'], output: '' }">
            <button x-on:click="items = ['bar']">click me</button>

            <template x-for="(item, index) in items">
                <span x-text="item" x-on:click="output = item"></span>
            </template>

            <h1 x-text="output"></h1>
        </div>
    `,
    get => {
        get('h1').should(haveText(''))
        get('span').click()
        get('h1').should(haveText('foo'))
        get('button').click()
        get('span').click()
        get('h1').should(haveText('bar'))
    }
)

test('nested x-for',
    `
        <div x-data="{ foos: [ {bars: ['bob', 'lob']} ] }">
            <button x-on:click="foos = [ {bars: ['bob', 'lob']}, {bars: ['law']} ]">click me</button>
            <template x-for="foo in foos">
                <h1>
                    <template x-for="bar in foo.bars">
                        <h2 x-text="bar"></h2>
                    </template>
                </h1>
            </template>
        </div>
    `,
    get => {
        get('h1:nth-of-type(1) h2:nth-of-type(1)').should(beVisible())
        get('h1:nth-of-type(1) h2:nth-of-type(2)').should(beVisible())
        get('h1:nth-of-type(2) h2:nth-of-type(1)').should(notBeVisible())
        get('button').click()
        get('h1:nth-of-type(1) h2:nth-of-type(1)').should(beVisible())
        get('h1:nth-of-type(1) h2:nth-of-type(2)').should(beVisible())
        get('h1:nth-of-type(2) h2:nth-of-type(1)').should(beVisible())
    }
)

test('x-for updates the right elements when new item are inserted at the beginning of the list',
    `
        <div x-data="{ items: [{name: 'one', key: '1'}, {name: 'two', key: '2'}] }">
            <button x-on:click="items = [{name: 'zero', key: '0'}, {name: 'one', key: '1'}, {name: 'two', key: '2'}]">click me</button>

            <template x-for="item in items" :key="item.key">
                <span x-text="item.name"></span>
            </template>
        </div>
    `,
    get => {
        get('span:nth-of-type(1)').should(haveText('one'))
        get('span:nth-of-type(2)').should(haveText('two'))
        get('button').click()
        get('span:nth-of-type(1)').should(haveText('zero'))
        get('span:nth-of-type(2)').should(haveText('one'))
        get('span:nth-of-type(3)').should(haveText('two'))
    }
)

test('nested x-for access outer loop variable',
    `
        <div x-data="{ foos: [ {name: 'foo', bars: ['bob', 'lob']}, {name: 'baz', bars: ['bab', 'lab']} ] }">
            <template x-for="foo in foos">
                <h1>
                    <template x-for="bar in foo.bars">
                        <h2 x-text="foo.name+': '+bar"></h2>
                    </template>
                </h1>
            </template>
        </div>
    `,
    get => {
        get('h1:nth-of-type(1) h2:nth-of-type(1)').should(haveText('foo: bob'))
        get('h1:nth-of-type(1) h2:nth-of-type(2)').should(haveText('foo: lob'))
        get('h1:nth-of-type(2) h2:nth-of-type(1)').should(haveText('baz: bab'))
        get('h1:nth-of-type(2) h2:nth-of-type(2)').should(haveText('baz: lab'))
    }
)

test('sibling x-for do not interact with each other',
    `
        <div x-data="{ foos: [1], bars: [1, 2] }">
            <template x-for="foo in foos">
                <h1 x-text="foo"></h1>
            </template>
            <template x-for="bar in bars">
                <h2 x-text="bar"></h2>
            </template>
            <button @click="foos = [1, 2];bars = [1, 2, 3]">Change</button>
        </div>
    `,
    get => {
        get('h1:nth-of-type(1)').should(haveText('1'))
        get('h2:nth-of-type(1)').should(haveText('1'))
        get('h2:nth-of-type(2)').should(haveText('2'))
        get('button').click()
        get('h1:nth-of-type(1)').should(haveText('1'))
        get('h1:nth-of-type(2)').should(haveText('2'))
        get('h2:nth-of-type(1)').should(haveText('1'))
        get('h2:nth-of-type(2)').should(haveText('2'))
        get('h2:nth-of-type(3)').should(haveText('3'))
    }
)

test('x-for over range using i in x syntax',
    `
        <div x-data>
            <template x-for="i in 10">
                <span x-text="i"></span>
            </template>
        </div>
    `,
    get => get('span').should(haveLength('10'))
)

test('x-for over range using i in property syntax',
    `
        <div x-data="{ count: 10 }">
            <template x-for="i in count">
                <span x-text="i"></span>
            </template>
        </div>
    `,
    get => get('span').should(haveLength('10'))
)

// @flaky
test.retry(2)('x-for with an array of numbers',
    `
        <div x-data="{ items: [] }">
            <template x-for="i in items">
                <span x-text="i"></span>
            </template>
            <button @click="items.push(2)" id="first">click me</button>
            <button @click="items.push(3)" id="second">click me</button>
        </div>
    `,
    get => {
        get('span').should(haveLength('0'))
        get('#first').click()
        get('span').should(haveLength('1'))
        get('#second').click()
        get('span').should(haveLength('2'))
    }
)
