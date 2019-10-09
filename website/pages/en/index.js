/**
 * Copyright (c) 2017-present, Redux-ORM.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const { MarkdownBlock, GridBlock, Container } = CompLibrary;

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

function docUrl(doc, language) {
    return `${siteConfig.baseUrl}${language ? `${language}/` : ''}${doc}`;
}

function imgUrl(img) {
    return `${siteConfig.baseUrl}img/${img}`;
}

class Button extends React.Component {
    render() {
        return (
            <div className="pluginWrapper buttonWrapper">
                <a
                    className="button hero"
                    href={this.props.href}
                    target={this.props.target}
                >
                    {this.props.children}
                </a>
            </div>
        );
    }
}

Button.defaultProps = {
    target: '_self',
};

const SplashContainer = props => (
    <div className="homeContainer">
        <div className="homeSplashFade">
            <div className="wrapper homeWrapper">{props.children}</div>
        </div>
    </div>
);

const ProjectTitle = () => (
    <React.Fragment>
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <img
                src={imgUrl('redux-orm.svg')}
                alt="Redux-ORM logo"
                width={100}
                height={100}
            />
            <h1 className="projectTitle">{siteConfig.title}</h1>
        </div>

        <h2 style={{ marginTop: '0.5em' }}>{siteConfig.tagline}</h2>
    </React.Fragment>
);

const PromoSection = props => (
    <div className="section promoSection">
        <div className="promoRow">
            <div className="pluginRowBlock">{props.children}</div>
        </div>
    </div>
);

class HomeSplash extends React.Component {
    render() {
        const language = this.props.language || '';
        return (
            <SplashContainer>
                <div className="inner">
                    <ProjectTitle />
                    <PromoSection>
                        <Button
                            href={docUrl(
                                'introduction/getting-started',
                                language,
                            )}
                        >
                            Get Started
                        </Button>
                    </PromoSection>
                </div>
            </SplashContainer>
        );
    }
}

const Installation = () => (
    <div className="productShowcaseSection" style={{ textAlign: 'center' }}>
        <h2 style={{ marginTop: 10, marginBottom: 5 }}>Installation</h2>
        <MarkdownBlock>``` npm install --save redux ```</MarkdownBlock>
    </div>
);

const Block = props => (
    <Container
        id={props.id}
        background={props.background}
        className={props.className}
    >
        <GridBlock
            align="center"
            contents={props.children}
            layout={props.layout}
        />
    </Container>
);

const FeaturesTop = props => (
    <Block layout="fourColumn" className="rowContainer featureBlock">
        {[
            {
                content:
                    'Redux-ORM is fast. **All queries are lazily evaluated** and come with a built-in **support for memoization**.',
                image: imgUrl('lightweight.svg'),
                imageAlign: 'top',
                title: 'Lightweight',
            },
            {
                content:
                    'It provides a clean abstraction over low-level updates, **protecting the state from accidental mutations.**',
                image: imgUrl('safe.svg'),
                imageAlign: 'top',
                title: 'Reliable',
            },
            {
                content:
                    'With nearly **100% branch coverage**, the library is thoroughly tested to ensure **rock solid code quality**.',
                image: imgUrl('stable.svg'),
                imageAlign: 'top',
                title: 'Stable',
            },
            {
                content:
                    'No matter where your data comes from, Redux-ORM will stay out of its way. Even a **custom database layer** is possible.',
                image: imgUrl('flexible.svg'),
                imageAlign: 'top',
                title: 'Flexible',
            },
        ]}
    </Block>
);

class Index extends React.Component {
    render() {
        const language = this.props.language || '';

        return (
            <div>
                <HomeSplash language={language} />
                <div className="mainContainer">
                    <div className="productShowcaseSection">
                        <Container background="light">
                            <FeaturesTop />
                        </Container>
                        <Container background="light" />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = Index;
