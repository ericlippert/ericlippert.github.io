"use strict";

function test(f)
{
    try
    {
        f();
    }
    catch(error)
    {
        return "FAIL: " + f.name + "\n" + error + "\n";
    }
    return "PASS:" + f.name;  
}

function fail(message = "")
{
    throw new Error("Assertion failed: " + message);
}

function assertThrows(f)
{
    try
    {
        f();
    }
    catch(error)
    {
        return;
    }
    fail("Did not throw.");
}

function assert(b, message = "")
{
    if (!b)
        fail(message);
}

function assertEqual(observed, expected)
{
    assert(
        observed === expected, 
        "\nExpected:\n" + expected + "\nObserved:\n" + observed + "\n");
}
