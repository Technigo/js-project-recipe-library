export default function Root() {
    return (
      <>
        <div id="sidebar">
          <h1>React Router Contacts</h1>
          <div>
            <form id="search-form" role="search">
              <input
                id="q"
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
              />
              <div
                id="search-spinner"
                aria-hidden
                hidden={true}
              />
              <div
                className="sr-only"
                aria-live="polite"
              ></div>
            </form>
            <form method="post">
              <button type="submit">New</button>
            </form>
          </div>
          <nav>
            <ul>
              <li>
                <a href={`/contacts/1`}>Your Name</a>
              </li>
              <li>
                <a href={`/contacts/2`}>Your Friend</a>
              </li>
            </ul>
          </nav>
        </div>
        <div id="detail"></div>
      </>
    );
  }
  import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <>
      {/* all the other elements */}
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
}
import { Outlet, Link } from "react-router-dom";

export default function Root() {
  return (
    <>
      <div id="sidebar">
        {/* other elements */}

        <nav>
          <ul>
            <li>
              <Link to={`contacts/1`}>Your Name</Link>
            </li>
            <li>
              <Link to={`contacts/2`}>Your Friend</Link>
            </li>
          </ul>
        </nav>

        {/* other elements */}
      </div>
    </>
  );
}
import { Outlet, Link } from "react-router-dom";
import { getContacts } from "../contacts";

export async function loader() {
  const contacts = await getContacts();
  return { contacts };
}
import {
    Outlet,
    Link,
    useLoaderData,
  } from "react-router-dom";
  import { getContacts } from "../contacts";
  
  /* other code */
  
  export default function Root() {
    const { contacts } = useLoaderData();
    return (
      <>
        <div id="sidebar">
          <h1>React Router Contacts</h1>
          {/* other code */}
  
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <Link to={`contacts/${contact.id}`}>
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite && <span>★</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
  
          {/* other code */}
        </div>
      </>
    );
  }
  import {
    Outlet,
    Link,
    useLoaderData,
    Form,
  } from "react-router-dom";
  import { getContacts, createContact } from "../contacts";
  
  export async function action() {
    const contact = await createContact();
    return { contact };
  }
  
  /* other code */
  
  export default function Root() {
    const { contacts } = useLoaderData();
    return (
      <>
        <div id="sidebar">
          <h1>React Router Contacts</h1>
          <div>
            {/* other code */}
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
  
          {/* other code */}
        </div>
      </>
    );
  }
  import {
    Outlet,
    Link,
    useLoaderData,
    Form,
    redirect,
  } from "react-router-dom";
  import { getContacts, createContact } from "../contacts";
  
  export async function action() {
    const contact = await createContact();
    return redirect(`/contacts/${contact.id}/edit`);
  }
  import {
    Outlet,
    NavLink,
    useLoaderData,
    Form,
    redirect,
  } from "react-router-dom";
  
  export default function Root() {
    return (
      <>
        <div id="sidebar">
          {/* other code */}
  
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      to={`contacts/${contact.id}`}
                      className={({ isActive, isPending }) =>
                        isActive
                          ? "active"
                          : isPending
                          ? "pending"
                          : ""
                      }
                    >
                      {/* other code */}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{/* other code */}</p>
            )}
          </nav>
        </div>
      </>
    );
  }
  import {
    // existing code
    useNavigation,
  } from "react-router-dom";
  
  // existing code
  
  export default function Root() {
    const { contacts } = useLoaderData();
    const navigation = useNavigation();
  
    return (
      <>
        <div id="sidebar">{/* existing code */}</div>
        <div
          id="detail"
          className={
            navigation.state === "loading" ? "loading" : ""
          }
        >
          <Outlet />
        </div>
      </>
    );
  }
  <form id="search-form" role="search">
  <input
    id="q"
    aria-label="Search contacts"
    placeholder="Search"
    type="search"
    name="q"
  />
  <div id="search-spinner" aria-hidden hidden={true} />
  <div className="sr-only" aria-live="polite"></div>
</form>
<Form id="search-form" role="search">
  <input
    id="q"
    aria-label="Search contacts"
    placeholder="Search"
    type="search"
    name="q"
  />
  <div id="search-spinner" aria-hidden hidden={true} />
  <div className="sr-only" aria-live="polite"></div>
</Form>
export async function loader({ request }) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const contacts = await getContacts(q);
    return { contacts };
  }
  // existing code

export async function loader({ request }) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const contacts = await getContacts(q);
    return { contacts, q };
  }
  
  export default function Root() {
    const { contacts, q } = useLoaderData();
    const navigation = useNavigation();
  
    return (
      <>
        <div id="sidebar">
          <h1>React Router Contacts</h1>
          <div>
            <Form id="search-form" role="search">
              <input
                id="q"
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
                defaultValue={q}
              />
              {/* existing code */}
            </Form>
            {/* existing code */}
          </div>
          {/* existing code */}
        </div>
        {/* existing code */}
      </>
    );
  }
  import { useEffect } from "react";

// existing code

export default function Root() {
  const { contacts, q } = useLoaderData();
  const navigation = useNavigation();

  useEffect(() => {
    document.getElementById("q").value = q;
  }, [q]);

  // existing code
}
// existing code
import {
    // existing code
    useSubmit,
  } from "react-router-dom";
  
  export default function Root() {
    const { contacts, q } = useLoaderData();
    const navigation = useNavigation();
    const submit = useSubmit();
  
    return (
      <>
        <div id="sidebar">
          <h1>React Router Contacts</h1>
          <div>
            <Form id="search-form" role="search">
              <input
                id="q"
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
                defaultValue={q}
                onChange={(event) => {
                  submit(event.currentTarget.form);
                }}
              />
              {/* existing code */}
            </Form>
            {/* existing code */}
          </div>
          {/* existing code */}
        </div>
        {/* existing code */}
      </>
    );
  }
  // existing code

export default function Root() {
    const { contacts, q } = useLoaderData();
    const navigation = useNavigation();
    const submit = useSubmit();
  
    const searching =
      navigation.location &&
      new URLSearchParams(navigation.location.search).has(
        "q"
      );
  
    useEffect(() => {
      document.getElementById("q").value = q;
    }, [q]);
  
    return (
      <>
        <div id="sidebar">
          <h1>React Router Contacts</h1>
          <div>
            <Form id="search-form" role="search">
              <input
                id="q"
                className={searching ? "loading" : ""}
                // existing code
              />
              <div
                id="search-spinner"
                aria-hidden
                hidden={!searching}
              />
              {/* existing code */}
            </Form>
            {/* existing code */}
          </div>
          {/* existing code */}
        </div>
        {/* existing code */}
      </>
    );
  }
  // existing code

export default function Root() {
    // existing code
  
    return (
      <>
        <div id="sidebar">
          <h1>React Router Contacts</h1>
          <div>
            <Form id="search-form" role="search">
              <input
                id="q"
                // existing code
                onChange={(event) => {
                  const isFirstSearch = q == null;
                  submit(event.currentTarget.form, {
                    replace: !isFirstSearch,
                  });
                }}
              />
              {/* existing code */}
            </Form>
            {/* existing code */}
          </div>
          {/* existing code */}
        </div>
        {/* existing code */}
      </>
    );
  }