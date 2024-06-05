// jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.[tj]sx?$': 'babel-jest'
    },
    moduleNameMapper: {
        '\\.(css|less)$': 'identity-obj-proxy'
    },
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    testPathIgnorePatterns: ['/node_modules/', '/public/'],
    transformIgnorePatterns: ['<rootDir>/node_modules/(?!axios)'],
    extensionsToTreatAsEsm: ['.jsx'],
};