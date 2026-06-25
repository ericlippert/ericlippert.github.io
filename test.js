"use strict";

function test(f)
{
    try
    {
        f();
    }
    catch(error)
    {
        return "FAIL: " + f.name + "\nUnhandled error:\n" + error + "\n";
    }
    return "SUCCESS: " + f.name;  
}

function expect(f, expected)
{
    try
    {
        const observed = f();
        if (observed !== expected)
        {
            return "FAIL: " + f.name + "\nExpected:\n" + expected + "\nObserved:\n" + observed + "\n";
        }
    }
    catch(error)
    {
        return "FAIL: " + f.name + "\nUnhandled error:\n" + error + "\n";
    }
    return "SUCCESS: " + f.name + "\n";
}

function assert(b)
{
    if (!b)
        throw new Error("Assertion failed");
}

function assertEqual(observed, expected)
{
    if (observed != expected)
        throw new Error("Assertion failed\nExpected:\n" + expected + "\nObserved:\n" + observed + "\n");
}
