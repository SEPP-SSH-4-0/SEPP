it("should trigger the add-to-cart event when clicked", function() {
    const button = document.createElement('button');
    let wasClicked = false;

    button.addEventListener('click', function() {
        wasClicked = true;
    });

    button.click();
    expect(wasClicked).toBeTrue();
});
describe("Timers", function() {
    it("should call a function after 2 seconds", function() {
        jasmine.clock().install();
        let called = false;
        setTimeout(function() {
            called = true;
        }, 2000);

        jasmine.clock().tick(2000);  // Fast-forward time by 2 seconds
        expect(called).toBeTrue();
        jasmine.clock().uninstall();
    });
});

